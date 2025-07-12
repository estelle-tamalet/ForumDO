import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PocketbaseService } from '../services/pocketbase.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css'
})
export class PostsComponent implements OnInit {
  posts: any[] = [];
  sujet: any = null;
  sujetId!: string;
  showPostForm = false;
  newPost = '';
  editingPost: any = null;
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;

  constructor(
    private route: ActivatedRoute,
    private pb: PocketbaseService
  ) {}

  // Méthode pour générer un tableau pour la pagination
  getPageNumbers(): number[] {
    const maxVisible = Math.min(this.totalPages, 5);
    return Array.from({ length: maxVisible }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    this.sujetId = this.route.snapshot.params['id'];
    const courseId = this.route.snapshot.params['courseId'];
    console.log('🔍 Sujet ID:', this.sujetId);
    console.log('🔍 Course ID:', courseId);

    this.loadPosts();

    // Récupérer le titre du sujet depuis la liste des sujets du cours
    if (courseId) {
      this.pb.getSujetsByCours(courseId).subscribe({
        next: (res) => {
          console.log('🔍 Réponse getSujetsByCours:', res);
          const sujetFound = res.items.find((s: any) => s.id === this.sujetId);
          if (sujetFound) {
            console.log('📋 Sujet trouvé:', sujetFound);
            console.log('📋 ID du cours dans le sujet:', sujetFound.cours);
            console.log('📋 Expansion cours:', sujetFound.expand?.cours);
            this.sujet = sujetFound;
          } else {
            console.log('❌ Sujet non trouvé dans la liste');
          }
        },
        error: (err) => {
          console.log('⚠️ Erreur lors de la récupération du sujet:', err);
        }
      });
    } else {
      console.log('❌ Pas de courseId dans l\'URL');
    }
  }

  private loadPosts() {
    this.pb.getPostsWithPagination(this.sujetId, this.currentPage, this.itemsPerPage).subscribe({
      next: (res) => {
        this.posts = res.items;
        this.totalPages = res.totalPages;
      },
      error: (err) => {
        console.error('❌ Erreur posts:', err);
      }
    });
  }

  togglePostForm() {
    this.showPostForm = !this.showPostForm;
    this.editingPost = null;
    this.newPost = '';
  }

  createPost() {
    if (this.newPost.trim()) {
      this.pb.createPost(this.newPost, this.sujetId).subscribe({
        next: () => {
          this.newPost = '';
          this.showPostForm = false;
          this.loadPosts();
        },
        error: (err) => {
          console.error('Erreur lors de la création du post:', err);
        }
      });
    }
  }

  editPost(post: any) {
    this.editingPost = post;
    this.newPost = post.contenu;
    this.showPostForm = true;
  }

  updatePost() {
    if (this.newPost.trim() && this.editingPost) {
      this.pb.updatePost(this.editingPost.id, this.newPost).subscribe({
        next: () => {
          this.newPost = '';
          this.showPostForm = false;
          this.editingPost = null;
          this.loadPosts();
        },
        error: (err) => {
          console.error('Erreur lors de la modification:', err);
        }
      });
    }
  }

  deletePost(post: any) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      this.pb.deletePost(post.id).subscribe({
        next: () => {
          this.loadPosts();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
        }
      });
    }
  }

  isOwner(post: any): boolean {
    return this.pb.isOwner(post.auteur);
  }

  submitForm() {
    if (this.editingPost) {
      this.updatePost();
    } else {
      this.createPost();
    }
  }

  // Pagination
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPosts();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPosts();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadPosts();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.loadPosts();
  }
}
