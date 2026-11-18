import { Routes } from '@angular/router';
import { AuthCallback } from './core/auth/auth-callback';

export const routes: Routes = [
  {
    path: 'auth/callback',
    component: AuthCallback,
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    children: [
      // --- Admision / Trayectoria (CRUD generico, origen) ---
      {
        path: 'crud/:slug',
        loadComponent: () => import('./features/crud-generic/crud-generic.component').then(m => m.CrudGenericComponent)
      },
      {
        path: 'admision/reniec',
        loadComponent: () => import('./features/admision/reniec-buscador.component').then(m => m.ReniecBuscadorComponent)
      },
      {
        path: 'admision/nueva-postulacion',
        loadComponent: () => import('./features/admision/wizard-postulacion.component').then(m => m.WizardPostulacionComponent)
      },
      {
        path: 'postulaciones',
        loadComponent: () => import('./features/admision/postulaciones.component').then(m => m.PostulacionesComponent),
      },
      {
        path: 'postulaciones/nueva',
        loadComponent: () => import('./features/admision/wizard-postulacion.component').then(m => m.WizardPostulacionComponent),
      },
      {
        path: 'trayectoria/plan',
        loadComponent: () => import('./features/trayectoria/plan-academico.component').then(m => m.PlanAcademicoComponent)
      },
      {
        path: 'mi-trayectoria',
        redirectTo: 'trayectoria/plan',
      },
      {
        path: 'trayectoria/alertas',
        loadComponent: () => import('./features/trayectoria/alertas.component').then(m => m.AlertasComponent),
      },

      // --- Gestion academica (destino) ---
      {
        path: 'personas',
        loadComponent: () => import('./features/personas/persona-list').then((m) => m.PersonaList),
      },
      {
        path: 'personas/nueva',
        loadComponent: () => import('./features/personas/persona-form').then((m) => m.PersonaForm),
      },
      {
        path: 'personas/:id/editar',
        loadComponent: () => import('./features/personas/persona-form').then((m) => m.PersonaForm),
      },
      {
        path: 'facultades',
        loadComponent: () => import('./features/facultades/facultad-list').then((m) => m.FacultadList),
      },
      {
        path: 'facultades/nueva',
        loadComponent: () => import('./features/facultades/facultad-form').then((m) => m.FacultadForm),
      },
      {
        path: 'facultades/:id/editar',
        loadComponent: () => import('./features/facultades/facultad-form').then((m) => m.FacultadForm),
      },
      {
        path: 'programas',
        loadComponent: () => import('./features/programas/programa-list').then((m) => m.ProgramaList),
      },
      {
        path: 'programas/nueva',
        loadComponent: () => import('./features/programas/programa-form').then((m) => m.ProgramaForm),
      },
      {
        path: 'programas/:id/editar',
        loadComponent: () => import('./features/programas/programa-form').then((m) => m.ProgramaForm),
      },
      {
        path: 'cursos',
        loadComponent: () => import('./features/cursos/curso-list').then((m) => m.CursoList),
      },
      {
        path: 'grupos',
        loadComponent: () => import('./features/grupos/grupo-list').then((m) => m.GrupoList),
      },
      {
        path: 'grupos/nuevo',
        loadComponent: () => import('./features/grupos/grupo-form').then((m) => m.GrupoForm),
      },
      {
        path: 'grupos/:id/editar',
        loadComponent: () => import('./features/grupos/grupo-form').then((m) => m.GrupoForm),
      },
      { path: 'secciones', redirectTo: 'grupos' },
      {
        path: 'planes-estudio',
        loadComponent: () => import('./features/planes-estudio/plan-estudio-list').then((m) => m.PlanEstudioList),
      },
      {
        path: 'planes-estudio/nueva',
        loadComponent: () => import('./features/planes-estudio/plan-estudio-form').then((m) => m.PlanEstudioForm),
      },
      {
        path: 'planes-estudio/:id',
        loadComponent: () => import('./features/planes-estudio/plan-estudio-detalle').then((m) => m.PlanEstudioDetalle),
      },
      {
        path: 'planes-estudio/:id/editar',
        loadComponent: () => import('./features/planes-estudio/plan-estudio-form').then((m) => m.PlanEstudioForm),
      },
      {
        path: 'matriculas',
        loadComponent: () => import('./features/matriculas/matricula-list').then((m) => m.MatriculaList),
      },
      {
        path: 'matriculas/nueva',
        loadComponent: () => import('./features/matriculas/matricula-form').then((m) => m.MatriculaForm),
      },
      {
        path: 'matriculas/:id/editar',
        loadComponent: () => import('./features/matriculas/matricula-form').then((m) => m.MatriculaForm),
      },
      {
        path: 'notas',
        loadComponent: () => import('./features/notas/nota-list').then((m) => m.NotaList),
      },
      {
        path: 'notas/nueva',
        loadComponent: () => import('./features/notas/nota-form').then((m) => m.NotaForm),
      },
      {
        path: 'notas/:id/editar',
        loadComponent: () => import('./features/notas/nota-form').then((m) => m.NotaForm),
      },
      {
        path: 'actas',
        loadComponent: () => import('./features/actas/acta-list').then((m) => m.ActaList),
      },
      {
        path: 'pagos',
        loadComponent: () => import('./features/pagos/pago-list').then((m) => m.PagoList),
      },
      {
        path: 'pagos/nueva',
        loadComponent: () => import('./features/pagos/pago-form').then((m) => m.PagoForm),
      },
    ],
  },
  { path: '**', redirectTo: '' }
];
