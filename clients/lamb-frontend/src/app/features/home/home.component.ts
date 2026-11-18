import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth-service';

interface Tile {
  label: string;
  icon: string;
  route: string | any[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  auth = inject(AuthService);

  tiles: Tile[] = [
    { label: 'ADMISIÓN',    icon: 'how_to_reg', route: ['/crud', 'convocatorias'] },
    { label: 'TRAYECTORIA', icon: 'route',      route: '/trayectoria/plan' },
    { label: 'GESTIÓN ACADÉMICA', icon: 'school',    route: '/facultades' },
    { label: 'MATRÍCULAS Y PAGOS', icon: 'payments', route: '/matriculas' },
    { label: 'INSTITUCIONAL', icon: 'account_balance', route: ['/crud', 'inst-niveles-academicos'] },
    { label: 'PERSONAS', icon: 'badge', route: ['/crud', 'per-personas'] }
  ];
}
