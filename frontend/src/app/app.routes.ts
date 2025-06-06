import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Edit } from './edit/edit';

export const routes: Routes = [
    {
        path: '',
        component: Home,
    },
    {
         path: 'edit/:id',
         component: Edit
    }
];
