"use client";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import React, { useState } from "react";
import { api } from "../../../convex/_generated/api";

// Small component to safely render exercises
const ExercisesList = ({ exercises }: { exercises?: string[] }) => {
  if (!exercises || exercises.length === 0) return null;

  return (
    <div className="ml-4">
      <p>Includes:</p>
      <ul className="list-circle list-inside">
        {exercises.map((ex, j) => (
          <li key={j}>{ex}</li>
        ))}
      </ul>
    </div>
  );
};

const Page = () => {
  const { user } = useUser();
  const userId = user?.id as string;

  const allPlan = useQuery(api.plans.getUserPlans, { userId });
  const [selectedPlanId, setSelectedPlanId] = useState<null | string>(null);

  const activePlan = allPlan?.find((plan) => plan.isActive);
  const currentPlan = selectedPlanId
    ? allPlan?.find((plan) => plan._id === selectedPlanId)
    : activePlan;

  if (!allPlan) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Your Plans</h1>

      {allPlan.map((plan) => (
        <div
          key={plan._id}
          className={`border rounded p-4 cursor-pointer ${
            plan._id === currentPlan?._id ? "border-blue-500" : "border-gray-300"
          }`}
          onClick={() => setSelectedPlanId(plan._id)}
        >
          <h2 className="text-lg font-semibold">{plan.name}</h2>
          <p className="text-sm text-gray-500">
            {plan.isActive ? "Active Plan" : "Click to select"}
          </p>

          <div className="mt-2">
            <h3 className="font-medium">Workout Plan</h3>
            {plan.workoutPlan.exercises.map((exerciseDay, i) => (
              <div key={i} className="mt-2">
                <p className="font-semibold">{exerciseDay.day}</p>
                {exerciseDay.routines.map((routine, idx) => (
                  <div key={idx} className="ml-4 mt-1">
                    <p>- {routine.name}</p>
                    {routine.sets && <p>Sets: {routine.sets}</p>}
                    {routine.reps && <p>Reps: {routine.reps}</p>}
                    {routine.duration && <p>Duration: {routine.duration}</p>}
                    {routine.description && <p>{routine.description}</p>}

                    {/* ✅ Safe check for exercises */}
                    <ExercisesList exercises={routine.exercises} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="font-medium">Diet Plan</h3>
            <p>Daily Calories: {plan.dietPlan.dailyCalories}</p>
            <ul className="list-disc list-inside mt-1">
              {plan.dietPlan.meals.map((meal, i) => (
                <li key={i}>
                  <strong>{meal.name}:</strong> {meal.foods.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Page;
