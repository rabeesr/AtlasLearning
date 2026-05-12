import { Badge } from "@/components/shared/ui";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCalibration } from "@/lib/progress/proficiency-calculator";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";

/**
 * Tiny pill showing the user's calibration ratio — % of high-confidence
 * answers that were actually correct. Hidden when there isn't enough data
 * or the user is signed out.
 */
export async function CalibrationBadge() {
  const user = await getCurrentUser();
  if (user.id === "demo-user") return null;
  const supabase = await getServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stats = await getCalibration(supabase as any, user.id);
  if (stats.totalHigh < 3 || stats.ratio === null) return null;
  const pct = Math.round(stats.ratio * 100);
  return (
    <Badge tone="accent">
      Calibration · {pct}% ({stats.correctOnHigh}/{stats.totalHigh} high-confidence correct)
    </Badge>
  );
}
