import type { Metadata } from "next";
import PlannerClient from "./PlannerClient";

export const metadata: Metadata = {
  title: "Planner – Wanderboard",
};

export default function PlannerPage() {
  return <PlannerClient />;
}
