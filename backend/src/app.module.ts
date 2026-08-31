import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { ProjectsModule } from './projects/projects.module';
import { SkillsModule } from './skills/skills.module';
import { BlogsModule } from './blogs/blogs.module';
import { MessagesModule } from './messages/messages.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const ssl =
          config.get('DATABASE_SSL', 'false') === 'true'
            ? { rejectUnauthorized: false }
            : false;

        // Hosted providers (Render, Neon, Supabase) hand out a single connection
        // string. Prefer it when present, else fall back to discrete vars for local dev.
        const url = config.get<string>('DATABASE_URL');

        return {
          type: 'postgres',
          ...(url
            ? { url }
            : {
                host: config.get<string>('DATABASE_HOST', 'localhost'),
                port: config.get<number>('DATABASE_PORT', 5432),
                username: config.get<string>('DATABASE_USER', 'postgres'),
                password: config.get<string>('DATABASE_PASSWORD', ''),
                database: config.get<string>('DATABASE_NAME', 'portfolio'),
              }),
          ssl,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    AuthModule,
    ProfileModule,
    ExperiencesModule,
    ProjectsModule,
    SkillsModule,
    BlogsModule,
    MessagesModule,
    SeedModule,
  ],
})
export class AppModule {}
