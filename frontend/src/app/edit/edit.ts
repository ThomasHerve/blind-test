import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule }    from '@angular/material/icon';
import { MatButtonModule }  from '@angular/material/button';

import { BlindService, BlindEntry } from '../services/blind';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './edit.html',
  styleUrls: ['./edit.css']
})
export class Edit implements OnInit {
  private route       = inject(ActivatedRoute);
  private blindService = inject(BlindService);

  entry: BlindEntry | undefined;

  ngOnInit(): void {
    // Récupérer l'id depuis l'URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.entry = this.blindService.getById(id);
    }
  }

  /** (Optionnel) Retour à l'accueil */
  goBack(): void {
    window.history.back();
  }
}
