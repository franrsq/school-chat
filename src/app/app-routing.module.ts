import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

// Send unauthorized users to login
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/']);

// Automatically log in users
const redirectLoggedToHome = () => redirectLoggedInTo(['/home']);

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule),
    ...canActivate(redirectLoggedToHome)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'sign-up',
    loadChildren: () => import('./pages/sign-up/sign-up.module').then(m => m.SignUpPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./modals/profile/profile.module').then(m => m.ProfilePageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'new-chat',
    loadChildren: () => import('./modals/new-chat/new-chat.module').then(m => m.NewChatPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'to-do-list/:chatId',
    loadChildren: () => import('./pages/to-do-list/to-do-list.module').then(m => m.ToDoListPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'chat-view/:chatId',
    loadChildren: () => import('./pages/chat-view/chat-view.module').then(m => m.ChatViewPageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'waiting',
    loadChildren: () => import('./modals/waiting/waiting.module').then( m => m.WaitingPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
