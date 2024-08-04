import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Table, DropdownButton, Dropdown } from 'react-bootstrap';
import dayjs from 'dayjs';

const App = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get('workout');
  const baseURL = `${process.env.PUBLIC_URL}/data`; 

  const [workoutData, setWorkoutData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!username) {
        setError('No workout specified');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${baseURL}/${username}-workout.json`);
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
  }, [username, baseURL]);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const currentWorkout = workoutData.find(workout => workout.date === selectedDate);
  const workout = currentWorkout ? currentWorkout.workout.find(w => w.title === selectedTitle) : null;

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100 mt-3 mt-md-0">
      <h1>Workout Plan</h1>
      {currentWorkout && <h2>Start date: {dayjs(currentWorkout.date).format('DD-MM-YYYY')}</h2>}
      {currentWorkout && <p>{currentWorkout.notes}</p>}
      <div className="d-flex w-100 justify-content-center justify-content-md-end mb-3">
        <DropdownButton id="dropdown-date-button" title={dayjs(selectedDate).format('DD-MM-YYYY')} className="me-3">
          {workoutData.map((w) => (
            <Dropdown.Item key={w.date} onClick={() => handleSelectDate(w.date)}>
              Start date: {dayjs(w.date).format('DD-MM-YYYY')}
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
    </Container>
  );
};

export default App;
