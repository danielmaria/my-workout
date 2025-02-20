import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Table,
  DropdownButton,
  Dropdown,
  Button,
  Form,
} from 'react-bootstrap';
import dayjs from 'dayjs';
import Confetti from 'react-confetti';
import ModalConfirmationComponent from './ModalConfirmationComponent';

const App = () => {
  const [searchParams] = useSearchParams();
  const username = searchParams.get('workout');
  const [workoutData, setWorkoutData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [frequencyCounts, setFrequencyCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [opacity, setOpacity] = useState(1);
  const { ModalUI, handleShow } = ModalConfirmationComponent();

  useEffect(() => {
    const savedCounts =
      JSON.parse(localStorage.getItem('frequencyCounts')) || {};
    setFrequencyCounts(savedCounts);
  }, []);

  useEffect(() => {
    localStorage.setItem('frequencyCounts', JSON.stringify(frequencyCounts));
  }, [frequencyCounts]);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      var workoutsArray = JSON.parse(localStorage.getItem('workoutData')) || [];
      if (workoutsArray.length === 0) {
        try {
          const indexResponse = await fetch(
            `/my-workout/data/${username}/index.json`
          );
          if (!indexResponse.ok) {
            throw new Error(`Could not find index for ${username}`);
          }

          const { files } = await indexResponse.json();

          const workoutPromises = files.map(async (file) => {
            const res = await fetch(`/my-workout/data/${username}/${file}`);
            return res.ok ? res.json() : [];
          });

          workoutsArray = (await Promise.all(workoutPromises)).flat();
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      }

      if (workoutsArray.length === 0) {
        handleShow(
          'Warning',
          'Something went wrong while loading your workout.'
        );
        return;
        // throw new Error(`No workout data found for ${username}`);
      }

      const sortedWorkouts = workoutsArray.sort((a, b) =>
        dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1
      );

      setWorkoutData(sortedWorkouts);

      const today = dayjs();
      const pastDates = sortedWorkouts.filter((workout) =>
        dayjs(workout.date).isBefore(today)
      );
      const nearestPastDate =
        pastDates.length > 0
          ? pastDates[pastDates.length - 1].date
          : sortedWorkouts[0].date;

      setSelectedDate(nearestPastDate);

      const initialWorkout = sortedWorkouts.find(
        (workout) => workout.date === nearestPastDate
      );

      if (initialWorkout && initialWorkout.workout.length > 0) {
        const savedCounts =
          JSON.parse(localStorage.getItem('frequencyCounts')) || {};
        const leastFrequentWorkout = initialWorkout.workout.reduce(
          (leastFrequent, currentWorkout) => {
            const currentKey = `${nearestPastDate}-${currentWorkout.title}`;
            const currentCount = savedCounts[currentKey] || 0;
            const leastFrequentKey = `${nearestPastDate}-${leastFrequent.title}`;
            const leastFrequentCount = savedCounts[leastFrequentKey] || 0;

            return currentCount < leastFrequentCount
              ? currentWorkout
              : leastFrequent;
          },
          initialWorkout.workout[0]
        );

        setSelectedTitle(leastFrequentWorkout.title);
      }

      localStorage.setItem('workoutData', JSON.stringify(sortedWorkouts));
      setLoading(false);
    };

    fetchWorkoutData();
  }, [username]);

  const handleEditExercise = (exerciseIndex, field, value) => {
    setWorkoutData((prevData) => {
      const updatedData = prevData.map((workout) => {
        if (workout.date === selectedDate) {
          return {
            ...workout,
            workout: workout.workout.map((w) => {
              if (w.title === selectedTitle) {
                return {
                  ...w,
                  exercises: w.exercises.map((exercise, idx) => {
                    if (idx === exerciseIndex) {
                      return { ...exercise, [field]: value };
                    }
                    return exercise;
                  }),
                };
              }
              return w;
            }),
          };
        }
        return workout;
      });
      localStorage.setItem('workoutData', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  const handleAddExercise = () => {
    setWorkoutData((prev) => {
      const updated = [...prev];
      const workout = updated.find((w) => w.date === selectedDate);
      if (workout) {
        workout.workout
          .find((w) => w.title === selectedTitle)
          .exercises.push({ name: '', series: 0, repetitions: 0, weight: 0 });
      }
      return updated;
    });
  };

  const handleExport = () => {
    const workout = workoutData.find((w) => w.date === selectedDate);
    if (workout) {
      const json = JSON.stringify(workout, null, 2);
      navigator.clipboard.writeText(json);
      handleShow(
        'Exported Training',
        'The workout has been copied to the clipboard successfully!'
      );
    }
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    const workout = workoutData.find((w) => w.date === date);
    if (workout && workout.workout.length > 0) {
      setSelectedTitle(workout.workout[0].title);
    }
  };

  const handleSelectTitle = (title) => {
    setSelectedTitle(title);
  };

  const onPressRefresh = async () => {
    await handleShow(
      'Important',
      'The changes you made have been cleared and your workout has been updated with the database. If you need your workout, with updates, it has been copied to your clipboard.'
    );
    localStorage.removeItem('workoutData');
    window.location.reload(false);
  };

  const handleIncrement = (date, title) => {
    setFrequencyCounts((prevCounts) => {
      const workoutKey = `${date}-${title}`;
      const currentWorkout = workoutData.find((w) => w.date === date);
      const currentWorkoutItem = currentWorkout.workout.find(
        (w) => w.title === title
      );
      const frequency = currentWorkoutItem ? currentWorkoutItem.frequency : 1;
      const count = prevCounts[workoutKey] || 0;

      if (count < frequency) {
        const updatedCounts = {
          ...prevCounts,
          [workoutKey]: count + 1,
        };

        if (count + 1 === frequency) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }

        return updatedCounts;
      }

      return prevCounts;
    });
  };

  const handleDecrement = (date, title) => {
    setFrequencyCounts((prevCounts) => {
      const workoutKey = `${date}-${title}`;
      const count = prevCounts[workoutKey] || 0;

      if (count > 0) {
        return {
          ...prevCounts,
          [workoutKey]: count - 1,
        };
      }

      return prevCounts;
    });
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null) {
      const swipeDistance = touchStartX - touchEndX;
      if (swipeDistance > 50) {
        fadeOutAndChangeTitle(selectNextTitle);
      } else if (swipeDistance < -50) {
        fadeOutAndChangeTitle(selectPreviousTitle);
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const fadeOutAndChangeTitle = (changeTitleFunction) => {
    setOpacity(0);
    setTimeout(() => {
      changeTitleFunction();
      setOpacity(1);
    }, 300);
  };

  const selectNextTitle = () => {
    if (currentWorkout) {
      const currentIndex = currentWorkout.workout.findIndex(
        (w) => w.title === selectedTitle
      );
      const nextIndex = (currentIndex + 1) % currentWorkout.workout.length;
      setSelectedTitle(currentWorkout.workout[nextIndex].title);
    }
  };

  const selectPreviousTitle = () => {
    if (currentWorkout) {
      const currentIndex = currentWorkout.workout.findIndex(
        (w) => w.title === selectedTitle
      );
      const previousIndex =
        (currentIndex - 1 + currentWorkout.workout.length) %
        currentWorkout.workout.length;
      setSelectedTitle(currentWorkout.workout[previousIndex].title);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div> {ModalUI} </div>;
  }

  const currentWorkout = workoutData.find(
    (workout) => workout.date === selectedDate
  );
  const workout = currentWorkout
    ? currentWorkout.workout.find((w) => w.title === selectedTitle)
    : null;

  const renderFrequencyCounter = () => {
    if (!workout) return null;

    const workoutKey = `${currentWorkout.date}-${workout.title}`;
    const count = frequencyCounts[workoutKey] || 0;
    const frequency = workout.frequency || 1;

    return (
      <div>
        <p className='mb-0 text-center'>Frequency control</p>
        <div className='d-flex align-items-center justify-content-center mb-3'>
          <Button
            variant='primary'
            onClick={() => handleDecrement(currentWorkout.date, workout.title)}
          >
            -
          </Button>
          <span className='mx-2'>
            {count} / {frequency}
          </span>
          <Button
            variant='primary'
            onClick={() => handleIncrement(currentWorkout.date, workout.title)}
          >
            +
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Container
      className='d-flex flex-column align-items-center justify-content-center min-vh-100 mt-3 mt-md-0'
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <h1>Workout Plan</h1>
      {currentWorkout && (
        <h2>Started at {dayjs(currentWorkout.date).format('DD-MM-YYYY')}</h2>
      )}
      {currentWorkout && <p>{currentWorkout.notes}</p>}
      <div className='d-flex w-100 justify-content-md-end justify-content-center mb-3'>
        <DropdownButton
          id='dropdown-date-button'
          title={dayjs(selectedDate).format('DD-MM-YYYY')}
          className='me-3'
        >
          {workoutData.map((w) => (
            <Dropdown.Item
              key={w.date}
              onClick={() => handleSelectDate(w.date)}
            >
              Started at {dayjs(w.date).format('DD-MM-YYYY')}
            </Dropdown.Item>
          ))}
        </DropdownButton>
        <DropdownButton id='dropdown-title-button' title={selectedTitle}>
          {currentWorkout &&
            currentWorkout.workout.map((w) => (
              <Dropdown.Item
                key={w.title}
                onClick={() => handleSelectTitle(w.title)}
              >
                {w.title}
              </Dropdown.Item>
            ))}
        </DropdownButton>
        <Button onClick={onPressRefresh} className='ms-3'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            fill='currentColor'
            className='bi bi-arrow-clockwise'
            viewBox='0 0 16 16'
          >
            <path
              fillRule='evenodd'
              d='M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z'
            />
            <path d='M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466' />
          </svg>
        </Button>
      </div>
      <div style={{ opacity, transition: 'opacity 0.3s ease-in-out' }}>
        {renderFrequencyCounter()}
        {workout && (
          <>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th style={{ width: '50%' }}>Exercise</th>
                  <th style={{ width: '15%' }}>Series</th>
                  <th style={{ width: '15%' }}>Repetitions</th>
                  <th style={{ width: '20%' }}>Weight</th>
                </tr>
              </thead>
              <tbody>
                {workout.exercises.map((exercise, idx) => (
                  <tr key={idx}>
                    <td>
                      <Form.Control
                        type='text'
                        value={exercise.name}
                        onChange={(e) =>
                          handleEditExercise(idx, 'name', e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        type='number'
                        value={exercise.series}
                        onChange={(e) =>
                          handleEditExercise(idx, 'series', e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        type='number'
                        value={exercise.repetitions}
                        onChange={(e) =>
                          handleEditExercise(idx, 'repetitions', e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <Form.Control
                        type='number'
                        value={exercise.weight}
                        onChange={(e) =>
                          handleEditExercise(idx, 'weight', e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className='d-flex w-100 justify-content-md-end justify-content-center mb-3'>
              <Button className='mt-2' onClick={handleAddExercise}>
                Add Exercise
              </Button>
              <Button className='mt-2 ms-2' onClick={handleExport}>
                Export Workout
              </Button>
              {ModalUI}
            </div>
          </>
        )}
      </div>
      {showConfetti && <Confetti />}
    </Container>
  );
};

export default App;
