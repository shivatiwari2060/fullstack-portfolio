import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import About from "@/components/sections/About";
import BlogPreview from "@/components/sections/BlogPreview";
import Contact from "@/components/sections/Contact";
import ExperienceTimeline from "@/components/sections/ExperienceTimeline";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import {
  getBlogs,
  getExperiences,
  getProfile,
  getProjects,
  getSkills,
} from "@/lib/api";

export default async function Home() {
  const [profile, experiences, projects, skills, blogs] = await Promise.all([
    getProfile(),
    getExperiences(),
    getProjects(),
    getSkills(),
    getBlogs(),
  ]);

  return (
    <main>
      <Navbar />
      <Hero profile={profile} />
      <About profile={profile} experiences={experiences} />
      <Skills skills={skills} />
      <ExperienceTimeline experiences={experiences} />
      <Projects projects={projects} githubUrl={profile?.githubUrl} />
      <BlogPreview blogs={blogs} />
      <Contact profile={profile} />
      <Footer name={profile?.name ?? "Shivaprasad Tiwari"} />
    </main>
  );
}
