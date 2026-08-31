import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { Blog } from '../blogs/blog.entity';
import { Experience } from '../experiences/experience.entity';
import { Profile } from '../profile/profile.entity';
import { Project } from '../projects/project.entity';
import { Skill } from '../skills/skill.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Profile) private readonly profiles: Repository<Profile>,
    @InjectRepository(Experience)
    private readonly experiences: Repository<Experience>,
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(Skill) private readonly skills: Repository<Skill>,
    @InjectRepository(Blog) private readonly blogs: Repository<Blog>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
    await this.seedProfile();
    await this.seedExperiences();
    await this.seedSkills();
    await this.seedProjects();
    await this.seedBlogs();
  }

  private async seedAdmin() {
    const email = this.config.get('ADMIN_EMAIL', 'admin@example.com');
    if (await this.users.findOne({ where: { email } })) return;
    const password = this.config.get('ADMIN_PASSWORD', 'Admin@123');
    await this.users.save(
      this.users.create({ email, passwordHash: await bcrypt.hash(password, 10) }),
    );
    this.logger.log(`Seeded admin user ${email}`);
  }

  private async seedProfile() {
    if (await this.profiles.count()) return;
    await this.profiles.save(
      this.profiles.create({
        name: 'Shivaprasad Tiwari',
        headline: 'Full Stack Developer — NestJS · FastAPI · React',
        about:
          'Full stack developer currently building scalable products at ASI Tech with NestJS and Python FastAPI. Previously shipped MERN-stack applications at ePrabhidi Pvt. Ltd. I enjoy crafting clean APIs, delightful UIs, and writing about the tech I work with.',
        email: 'pavithraamalaroshinip@gmail.com',
        location: 'India',
        githubUrl: 'https://github.com/',
        linkedinUrl: 'https://linkedin.com/in/',
      }),
    );
    this.logger.log('Seeded profile');
  }

  private async seedExperiences() {
    if (await this.experiences.count()) return;
    await this.experiences.save([
      this.experiences.create({
        company: 'ASI Tech',
        role: 'Full Stack Developer',
        description:
          'Building and maintaining full stack applications with NestJS and Python FastAPI. Designing REST APIs, integrating PostgreSQL databases, and delivering end-to-end features across the stack.',
        techStack: ['NestJS', 'FastAPI', 'Python', 'TypeScript', 'PostgreSQL', 'React'],
        startDate: '2025',
        current: true,
        sortOrder: 0,
      }),
      this.experiences.create({
        company: 'ePrabhidi Pvt. Ltd.',
        role: 'MERN Stack Developer',
        description:
          'Developed web applications using MongoDB, Express, React, and Node.js. Built reusable UI components, REST APIs, and collaborated with the team to ship client projects.',
        techStack: ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript'],
        startDate: '2023',
        endDate: '2025',
        current: false,
        sortOrder: 1,
      }),
    ]);
    this.logger.log('Seeded experiences');
  }

  private async seedSkills() {
    if (await this.skills.count()) return;
    const data: Array<Partial<Skill>> = [
      { name: 'React', category: 'frontend', level: 90, sortOrder: 0 },
      { name: 'Next.js', category: 'frontend', level: 85, sortOrder: 1 },
      { name: 'TypeScript', category: 'frontend', level: 88, sortOrder: 2 },
      { name: 'Three.js', category: 'frontend', level: 70, sortOrder: 3 },
      { name: 'Tailwind CSS', category: 'frontend', level: 85, sortOrder: 4 },
      { name: 'NestJS', category: 'backend', level: 88, sortOrder: 0 },
      { name: 'Node.js', category: 'backend', level: 90, sortOrder: 1 },
      { name: 'Express', category: 'backend', level: 88, sortOrder: 2 },
      { name: 'Python', category: 'backend', level: 80, sortOrder: 3 },
      { name: 'FastAPI', category: 'backend', level: 82, sortOrder: 4 },
      { name: 'PostgreSQL', category: 'database', level: 82, sortOrder: 0 },
      { name: 'MongoDB', category: 'database', level: 88, sortOrder: 1 },
      { name: 'Redis', category: 'database', level: 70, sortOrder: 2 },
      { name: 'Docker', category: 'devops', level: 72, sortOrder: 0 },
      { name: 'Git', category: 'devops', level: 90, sortOrder: 1 },
      { name: 'Vercel', category: 'devops', level: 80, sortOrder: 2 },
      { name: 'PyTorch', category: 'ai_ml', level: 60, sortOrder: 0 },
      { name: 'scikit-learn', category: 'ai_ml', level: 65, sortOrder: 1 },
      { name: 'Pandas', category: 'ai_ml', level: 70, sortOrder: 2 },
      { name: 'NumPy', category: 'ai_ml', level: 70, sortOrder: 3 },
      { name: 'LangChain', category: 'ai_ml', level: 55, sortOrder: 4 },
    ];
    await this.skills.save(data.map((s) => this.skills.create(s)));
    this.logger.log('Seeded skills');
  }

  private async seedProjects() {
    if (await this.projects.count()) return;
    await this.projects.save([
      this.projects.create({
        title: 'Animated 3D Portfolio',
        description:
          'This very site — a Next.js frontend with a Three.js particle hero, powered by a NestJS + PostgreSQL backend with a full admin panel and blog engine.',
        techStack: ['Next.js', 'Three.js', 'NestJS', 'PostgreSQL', 'Tailwind CSS'],
        githubUrl: 'https://github.com/',
        liveUrl: '',
        featured: true,
        sortOrder: 0,
      }),
      this.projects.create({
        title: 'Sample MERN Application',
        description:
          'Placeholder project — replace this with your real work from the admin panel. Describe what it does, the problems it solves, and what you built.',
        techStack: ['MongoDB', 'Express', 'React', 'Node.js'],
        githubUrl: 'https://github.com/',
        featured: false,
        sortOrder: 1,
      }),
    ]);
    this.logger.log('Seeded projects');
  }

  private async seedBlogs() {
    if (await this.blogs.count()) return;
    await this.blogs.save(
      this.blogs.create({
        title: 'From MERN to NestJS and FastAPI: My Full Stack Journey',
        slug: 'from-mern-to-nestjs-and-fastapi',
        excerpt:
          'How I moved from building MERN apps at ePrabhidi to working with NestJS and Python FastAPI at ASI Tech — and what I learned along the way.',
        content: [
          'I started my career as a **MERN stack developer** at ePrabhidi Pvt. Ltd., building applications with MongoDB, Express, React, and Node.js. Today I work at **ASI Tech** as a full stack developer, primarily with **NestJS** and **Python FastAPI**.',
          '',
          '## What changed',
          '',
          'Express gives you total freedom — NestJS gives you structure. Modules, dependency injection, decorators, and guards make large codebases much easier to maintain.',
          '',
          '## Why FastAPI too?',
          '',
          'FastAPI brings the same developer experience to Python: type hints, automatic validation with Pydantic, and generated OpenAPI docs out of the box.',
          '',
          '## Takeaways',
          '',
          '- Learn the fundamentals (HTTP, databases, auth) — frameworks are interchangeable.',
          '- Structure matters more as teams and codebases grow.',
          '- Being polyglot (TypeScript + Python) makes you far more versatile.',
          '',
          '*This is a seeded sample post — edit or replace it from the admin panel.*',
        ].join('\n'),
        tags: ['NestJS', 'FastAPI', 'MERN', 'Career'],
        published: true,
      }),
    );
    this.logger.log('Seeded blog post');
  }
}
