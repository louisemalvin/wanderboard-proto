import { User } from "lucide-react";
import Card from "@/components/shared/card";
import EmptyState from "@/components/shared/empty-state";

export default function ProfilePage() {
  return (
    <div className="py-8 px-4">
      <Card padding="lg">
        <h1 className="sr-only">Your Profile</h1>
        <EmptyState
          icon={User}
          title="Your Profile"
          description="Trip preferences, saved destinations, and account settings will appear here in a future update."
        />
      </Card>
    </div>
  );
}
