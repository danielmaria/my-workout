# My Workout 💪

## Project Overview

My Workout is a simple web application designed to provide easy access to workout routines. The project aims to be straightforward and functional without the need for a complex backend. It was created as a personal exercise to learn and practice React, showcasing how React can be used to build interactive and dynamic user interfaces.

## Features

- No Backend: This project doesn't rely on a backend. All data is stored locally, making it simple and easy to use.
- Local Storage: Workout data is saved in the browser's local storage. This approach avoids the need for centralized data management but means data can be lost if the cache is cleared or if the user switches browsers or devices.
- Workout Tracking: Users can select a workout routine, increment the number of times they've completed it, and visualize progress.
- Dynamic Selection: The application dynamically loads workout routines based on a query parameter in the URL.

## Local Storage Details

Since My Workout uses local storage, it's important to note that:

- Data is stored per browser: Clearing the cache will erase the data.
- No cross-device sync: Data is not shared between devices or browsers.
- Persistence: While convenient for quick access, it lacks the permanence of server-side storage.

## Deployment

The application is deployed using GitHub Pages.

To find a workout, you need to specify a workout query parameter in the URL. For example:

```
https://danielmaria.github.io/my-workout/?workout=daniel
```

This URL structure expects a JSON file named daniel-workout.json in the public/data directory. If the specified file is not found, an error message will be displayed.

## Running the Project Locally

To run this project on your local machine, follow these steps:

1. Clone the repository:

```sh
git clone https://github.com/danielmaria/my-workout.git
cd my-workout
```

2. Install dependencies and star the development server:

```sh
npm install
npm start
```

3. Access the application:
Open your browser and go to `http://localhost:3000/my-workout/?workout=your_workout_name`, replacing your_workout_name with the name of your JSON file.

## JSON Structure

To add a new workout routine, place a JSON file in the public/data directory with the following structure:

```json
[
  {
    "date": "YYYY-MM-DD",
    "notes": "Some notes about the workout",
    "workout": [
      {
        "title": "Workout Title",
        "frequency": 3,
        "exercises": [
          {
            "name": "Exercise Name",
            "series": "3",
            "repetitions": "10",
            "weight": "50kg"
          }
        ]
      }
    ]
  }
]
```

Replace the placeholders with actual data relevant to the workout.

## Conclusion

My Workout serves as a simple and accessible tool for managing and tracking workout routines. It demonstrates the power of React in building interactive web applications and provides a practical example of using local storage for data persistence. While not designed for complex use cases, it meets its goal of providing easy access to workout routines without the need for a backend.
