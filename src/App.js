import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Table, DropdownButton, Dropdown, Button } from 'react-bootstrap';
import dayjs from 'dayjs';
import Confetti from 'react-confetti';

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

  useEffect(() => {
    const savedCounts = JSON.parse(localStorage.getItem('frequencyCounts')) || {};
    setFrequencyCounts(savedCounts);
  }, []);

  useEffect(() => {
    localStorage.setItem('frequencyCounts', JSON.stringify(frequencyCounts));
  }, [frequencyCounts]);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      try {
        const response = await fetch(`/my-workout/data/${username}-workout.json`);
        if (!response.ok) {
          throw new Error(`Could not find data for ${username}`);
        }
        const data = await response.json();
        setWorkoutData(data);

        const today = dayjs();
        const pastDates = data.filter(workout => dayjs(workout.date).isBefore(today));
        const nearestPastDate = pastDates.length > 0 ? pastDates[pastDates.length - 1].date : data[0].date;

        setSelectedDate(nearestPastDate);
        const initialWorkout = data.find(workout => workout.date === nearestPastDate);
        if (initialWorkout && initialWorkout.workout.length > 0) {
          setSelectedTitle(initialWorkout.workout[0].title);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchWorkoutData();
  }, [username]);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    const workout = workoutData.find(w => w.date === date);
    if (workout && workout.workout.length > 0) {
      setSelectedTitle(workout.workout[0].title);
    }
  };

  const handleSelectTitle = (title) => {
    setSelectedTitle(title);
  };

  const handleIncrement = (date, title) => {
    setFrequencyCounts(prevCounts => {
      const workoutKey = `${date}-${title}`;
      const currentWorkout = workoutData.find(w => w.date === date);
      const currentWorkoutItem = currentWorkout.workout.find(w => w.title === title);
      const frequency = currentWorkoutItem ? currentWorkoutItem.frequency : 1;
      const count = prevCounts[workoutKey] || 0;

      if (count < frequency) {
        const updatedCounts = {
          ...prevCounts,
          [workoutKey]: count + 1
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
    setFrequencyCounts(prevCounts => {
      const workoutKey = `${date}-${title}`;
      const count = prevCounts[workoutKey] || 0;

      if (count > 0) {
        return {
          ...prevCounts,
          [workoutKey]: count - 1
        };
      }

      return prevCounts;
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const currentWorkout = workoutData.find(workout => workout.date === selectedDate);
  const workout = currentWorkout ? currentWorkout.workout.find(w => w.title === selectedTitle) : null;

  const renderFrequencyCounter = () => {
    if (!workout) return null;

    const workoutKey = `${currentWorkout.date}-${workout.title}`;
    const count = frequencyCounts[workoutKey] || 0;
    const frequency = workout.frequency || 1;

    return (
      <div>
      <p className="mb-0">Frequency control</p>
      <div className="d-flex align-items-center justify-content-center">
        <Button variant="primary" onClick={() => handleDecrement(currentWorkout.date, workout.title)}>-</Button>
        <span className="mx-2">{count} / {frequency}</span>
        <Button variant="primary" onClick={() => handleIncrement(currentWorkout.date, workout.title)}>+</Button>
      </div>
      </div>
    );
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100 mt-3 mt-md-0">
      <h1>Workout Plan</h1>
      {currentWorkout && <h2>Started at {dayjs(currentWorkout.date).format('DD-MM-YYYY')}</h2>}
      {currentWorkout && <p>{currentWorkout.notes}</p>}
      <div className="d-flex w-100 justify-content-md-end justify-content-center mb-3">
        <DropdownButton id="dropdown-date-button" title={dayjs(selectedDate).format('DD-MM-YYYY')} className="me-3">
          {workoutData.map((w) => (
            <Dropdown.Item key={w.date} onClick={() => handleSelectDate(w.date)}>
              Started at {dayjs(w.date).format('DD-MM-YYYY')}
            </Dropdown.Item>
          ))}
        </DropdownButton>
        <DropdownButton id="dropdown-title-button" title={selectedTitle}>
          {currentWorkout && currentWorkout.workout.map((w) => (
            <Dropdown.Item key={w.title} onClick={() => handleSelectTitle(w.title)}>
              {w.title}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </div>
      {renderFrequencyCounter()}
      {workout && (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Series</th>
              <th>Repetitions</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            {workout.exercises.map((exercise, idx) => (
              <tr key={idx}>
                <td>{exercise.name}</td>
                <td>{exercise.series}</td>
                <td>{exercise.repetitions}</td>
                <td>{exercise.weight}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {showConfetti && <Confetti />}
    </Container>
  );
};

export default App;
