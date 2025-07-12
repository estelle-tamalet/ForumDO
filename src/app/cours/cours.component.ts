import { Component, OnInit } from '@angular/core';
import { PocketbaseService } from '../services/pocketbase.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cours',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './cours.component.html',
  styleUrl: './cours.component.css'
})
export class CoursComponent implements OnInit {
  cours: any[] = [];
  isLoading = true;
  error = '';
  showCourseForm = false;
  newCours = '';
  editingCours: any = null;
  currentPage = 1;
  itemsPerPage = 3;
  totalPages = 1;

  constructor(private pb: PocketbaseService, private router: Router) {}

  getPageNumbers(): number[] {
    const maxVisible = Math.min(this.totalPages, 5);
    return Array.from({ length: maxVisible }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.router.navigate(['/login']).catch(err => console.error('Navigation error:', err));
      return;
    }

    this.loadCours();
  }

  loadCours() {
    this.pb.getCoursWithPagination(this.currentPage, this.itemsPerPage).subscribe({
      next: (res: any) => {
        console.log("📚 cours reçus :", res.items);
        this.cours = res.items;
        this.totalPages = res.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur lors du chargement des cours", err);
        this.error = "Impossible de charger les cours";
        this.isLoading = false;
      }
    });
  }

  toggleCourseForm() {
    this.showCourseForm = !this.showCourseForm;
    this.editingCours = null;
    this.newCours = '';
  }

  createCours() {
    if (this.newCours.trim()) {
      this.pb.createCours(this.newCours).subscribe({
        next: () => {
          this.newCours = '';
          this.showCourseForm = false;
          this.loadCours();
        },
        error: (err) => {
          console.error('Erreur lors de la création du cours:', err);
          this.error = "Impossible de créer le cours";
        }
      });
    }
  }

  editCours(cours: any) {
    this.editingCours = cours;
    this.newCours = cours.title;
    this.showCourseForm = true;
  }

  updateCours() {
    if (this.newCours.trim() && this.editingCours) {
      this.pb.updateCours(this.editingCours.id, this.newCours).subscribe({
        next: () => {
          this.newCours = '';
          this.showCourseForm = false;
          this.editingCours = null;
          this.loadCours();
        },
        error: (err) => {
          console.error('Erreur lors de la modification:', err);
          this.error = "Impossible de modifier le cours";
        }
      });
    }
  }

  deleteCours(cours: any) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le cours "${cours.title}" ?`)) {
      this.pb.deleteCours(cours.id).subscribe({
        next: () => {
          this.loadCours();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.error = "Impossible de supprimer le cours";
        }
      });
    }
  }

  isOwner(cours: any): boolean {
    return this.pb.isOwner(cours.auteur);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCours();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCours();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadCours();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.loadCours();
  }

  submitForm() {
    if (this.editingCours) {
      this.updateCours();
    } else {
      this.createCours();
    }
  }
}
