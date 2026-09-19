import type { CourseSummary } from "../data/mockCourses";
import { supabase } from "../lib/supabase";

export async function saveCourse(course: CourseSummary) {
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("로그인이 필요합니다.");
  const { data: existing } = await supabase
    .from("saved_courses")
    .select("id")
    .eq("user_id", userData.user.id)
    .eq("title", course.title)
    .maybeSingle();
  if (existing) return;
  const { error } = await supabase.from("saved_courses").insert({
    user_id: userData.user.id,
    title: course.title,
    course_data: course,
  });
  if (error) throw error;
}

export async function listSavedCourses() {
  if (!supabase) return [] as CourseSummary[];
  const { data, error } = await supabase
    .from("saved_courses")
    .select("course_data")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => row.course_data as CourseSummary);
}
