import type { CourseSummary } from "../data/mockCourses";
import { supabase } from "../lib/supabase";

export async function saveCourse(course: CourseSummary) {
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("로그인이 필요합니다.");
  const { data: existing, error: lookupError } = await supabase
    .from("saved_courses")
    .select("id")
    .eq("user_id", userData.user.id)
    .eq("title", course.title)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) {
    const { data: updated, error } = await supabase.from("saved_courses").update({ course_data: course }).eq("id", existing.id).eq("user_id", userData.user.id).select("id");
    if (error) throw error;
    if (!updated?.length) throw new Error("저장한 경로를 갱신할 권한이 없어요. saved_courses UPDATE 정책을 확인해주세요.");
    return;
  }
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
