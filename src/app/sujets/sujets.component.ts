import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PocketbaseService } from '../services/pocketbase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sujets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sujets.component.html',
  styleUrl: './sujets.component.css',
  encapsulation: ViewEncapsulation.None
})
export class SujetsComponent implements OnInit {
  sujets: any[] = [];
  coursId!: string;
  isLoading: boolean = true;
  error: string = '';
  isCreating: boolean = false;

  showForm: boolean = false;
  newSujet: string = '';
  editingSujet: any = null;
  perPage: number = 9;
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    private route: ActivatedRoute,
    private pb: PocketbaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.router.navigate(['/login']).catch(err => console.error('Navigation error:', err));
      return;
    }

    this.coursId = this.route.snapshot.params['id'];
    this.loadSujets();
  }

  loadSujets() {
    this.isLoading = true;
    this.error = '';

    this.pb.getSujetsWithPagination(this.coursId, this.currentPage, this.perPage).subscribe({
      next: (res) => {
        console.log('Sujets récupérés:', res);
        this.totalPages = res.totalPages;

        if (!res.items || res.items.length === 0) {
          this.sujets = [];
          this.isLoading = false;
          return;
        }

        const sujetsEnrichis: any[] = [];
        let compteurTraitement = 0;

        res.items.forEach((sujet: any, index: number) => {
          this.pb.getPostsBySujet(sujet.id).subscribe({
            next: (postsData: any) => {
              console.log(`Posts pour sujet ${sujet.id}:`, postsData);

              const postCount = postsData.totalItems || 0;
              let lastPostDate = null;
              let lastPostAuthor = null;

              if (postCount > 0 && postsData.items && postsData.items.length > 0) {
                const sortedPosts = postsData.items.sort((a: any, b: any) =>
                  new Date(b.created).getTime() - new Date(a.created).getTime()
                );

                const lastPost = sortedPosts[0];
                lastPostDate = this.formatDate(lastPost.created);
                lastPostAuthor = lastPost.expand?.auteur?.name || 'Utilisateur inconnu';
              }

              sujetsEnrichis[index] = {
                ...sujet,
                postCount: postCount,
                lastPostDate: lastPostDate,
                lastPostAuthor: lastPostAuthor
              };

              compteurTraitement++;
              console.log(`Sujet ${index} traité: ${postCount} posts, dernier: ${lastPostDate}`);

              if (compteurTraitement === res.items.length) {
                this.sujets = sujetsEnrichis.filter(s => s !== undefined);
                this.isLoading = false;
                console.log('Tous les sujets traités:', this.sujets);
              }
            },
            error: (err) => {
              console.error(`Erreur pour le sujet ${sujet.id}:`, err);
              // Même en cas d'erreur, ajouter le sujet sans informations de posts
              sujetsEnrichis[index] = {
                ...sujet,
                postCount: 0,
                lastPostDate: null,
                lastPostAuthor: null
              };

              compteurTraitement++;
              if (compteurTraitement === res.items.length) {
                this.sujets = sujetsEnrichis.filter(s => s !== undefined);
                this.isLoading = false;
              }
            }
          });
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des sujets:', err);
        this.error = "Impossible de charger les sujets";
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '--';

    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < oneDay && date.getDate() === now.getDate()) {
      return `Aujourd'hui à ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    if (diff < 2 * oneDay && date.getDate() === now.getDate() - 1) {
      return `Hier à ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} à ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  toggleForm() {
    this.showForm = !this.showForm;
    this.editingSujet = null;
    this.newSujet = '';
  }

  createSujet() {
    if (this.newSujet.trim()) {
      this.isCreating = true;
      this.pb.createSujet(this.newSujet, this.coursId).subscribe({
        next: () => {
          this.newSujet = '';
          this.showForm = false;
          this.isCreating = false;
          this.loadSujets();
        },
        error: (err) => {
          console.error('Erreur lors de la création du sujet', err);
          this.error = "Impossible de créer le sujet";
          this.isCreating = false;
        }
      });
    }
  }

  editSujet(sujet: any) {
    this.editingSujet = sujet;
    this.newSujet = sujet.titre;
    this.showForm = true;
  }

  updateSujet() {
    if (this.newSujet.trim() && this.editingSujet) {
      this.pb.updateSujet(this.editingSujet.id, this.newSujet).subscribe({
        next: () => {
          this.newSujet = '';
          this.showForm = false;
          this.editingSujet = null;
          this.loadSujets();
        },
        error: (err) => {
          console.error('Erreur lors de la modification:', err);
          this.error = "Impossible de modifier le sujet";
        }
      });
    }
  }

  deleteSujet(sujet: any) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le sujet "${sujet.titre}" ?`)) {
      this.pb.deleteSujet(sujet.id).subscribe({
        next: () => {
          this.loadSujets();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.error = "Impossible de supprimer le sujet";
        }
      });
    }
  }

  isOwner(sujet: any): boolean {
    return this.pb.isOwner(sujet.auteur);
  }

  goToPosts(sujetId: string) {
    this.router.navigate(['/cours', this.coursId, 'sujets', sujetId, 'posts'])
      .catch(err => console.error('Navigation error:', err));
  }

  submitForm() {
    if (this.editingSujet) {
      this.updateSujet();
    } else {
      this.createSujet();
    }
  }

  onPerPageChange() {
    this.currentPage = 1;
    this.loadSujets();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadSujets();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSujets();
    }
  }

  goToPage(page: number) {
    if (page > 0 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadSujets();
    }
  }

  pageNumbers(): number[] {
    if (this.totalPages <= 5) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    } else {
      const pages: number[] = [];

      pages.push(1);

      let start = Math.max(2, this.currentPage - 1);
      let end = Math.min(this.totalPages - 1, this.currentPage + 1);

      if (start > 2) {
        pages.push(-1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < this.totalPages - 1) {
        pages.push(-2);
      }

      if (this.totalPages > 1) {
        pages.push(this.totalPages);
      }

      return pages;
    }
  }
}
