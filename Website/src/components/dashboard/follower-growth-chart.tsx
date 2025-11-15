"use client";

import { useEffect, useState } from "react";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface FollowerData {
  date: string;
  followers: number;
}

export function FollowerGrowthChart({ userId }: { userId: string }) {
  const [data, setData] = useState<FollowerData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchFollowerData() {
      try {
        // Fetch current follower count
        const { data: profile } = await supabase
          .from("profiles")
          .select("follower_count, created_at")
          .eq("id", userId)
          .single();

        if (!profile) {
          setLoading(false);
          return;
        }

        // For now, we'll create a simple chart with current data
        // In a real implementation, you'd track historical follower counts
        const currentDate = new Date();
        const dataPoints: FollowerData[] = [];
        
        // Generate last 7 days of data (simulated)
        for (let i = 6; i >= 0; i--) {
          const date = new Date(currentDate);
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          
          // Simulate gradual growth (in real app, this would come from historical data)
          const estimatedFollowers = Math.max(
            profile.follower_count - (6 - i) * 2,
            profile.follower_count * 0.7
          );
          
          dataPoints.push({
            date: dateStr,
            followers: Math.round(estimatedFollowers),
          });
        }

        // Add current follower count
        dataPoints.push({
          date: "Today",
          followers: profile.follower_count,
        });

        setData(dataPoints);
      } catch (error) {
        console.error("Error fetching follower data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFollowerData();
  }, [userId, supabase]);

  if (loading) {
    return <Skeleton className="w-full h-[350px]" />;
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        <p>No follower data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Line
            type="monotone"
            dataKey="followers"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

