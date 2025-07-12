import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { CoursComponent } from './cours/cours.component';
import { SujetsComponent } from './sujets/sujets.component';
import { PostsComponent } from './posts/posts.component';

export const routes: Routes = [
  { path: '', redirectTo: 'cours', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'cours', component: CoursComponent },
  { path: 'cours/:id/sujets', component: SujetsComponent },
  { path: 'sujets/:id/posts', component: PostsComponent },
  { path: 'cours/:courseId/sujets/:id/posts', component: PostsComponent }
];
