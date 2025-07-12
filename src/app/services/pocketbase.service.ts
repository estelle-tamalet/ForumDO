import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PocketbaseService {
  private baseUrl = 'http://127.0.0.1:8090/api';
  private token = '';
  private userId = '';

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem('auth_token') || '';
    this.userId = localStorage.getItem('user_id') || '';
    if (this.token) {
      console.log("🔄 Token restauré depuis le localStorage");
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/collections/users/auth-with-password`, {
      identity: email,
      password: password
    });
  }

  setAuth(token: string, userId: string) {
    this.token = token;
    this.userId = userId;

    if (token) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_id', userId);
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
    }
  }

  getSujetsByCours(coursId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/collections/sujets/records?filter=cours="${coursId}"&expand=auteur,posts,cours`, {
      headers: this.getHeaders()
    });
  }

  getPostsBySujet(sujetId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/collections/posts/records?filter=sujet="${sujetId}"&expand=auteur`, {
      headers: this.getHeaders()
    });
  }

  createSujet(title: string, coursId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/collections/sujets/records`, {
      titre: title,
      cours: coursId,
      auteur: this.userId
    }, {
      headers: this.getHeaders()
    });
  }

  createPost(content: string, sujetId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/collections/posts/records`, {
      contenu: content,
      sujet: sujetId,
      auteur: this.userId
    }, {
      headers: this.getHeaders()
    });
  }

  createCours(title: string): Observable<any> {
    console.log('🚀 Création cours avec userId:', this.userId);
    return this.http.post(`${this.baseUrl}/collections/cours/records`, {
      title: title,
      auteur: this.userId
    }, {
      headers: this.getHeaders()
    });
  }

  updateCours(id: string, title: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/collections/cours/records/${id}`, {
      title: title
    }, {
      headers: this.getHeaders()
    });
  }

  updateSujet(id: string, title: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/collections/sujets/records/${id}`, {
      titre: title
    }, {
      headers: this.getHeaders()
    });
  }

  updatePost(id: string, content: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/collections/posts/records/${id}`, {
      contenu: content
    }, {
      headers: this.getHeaders()
    });
  }

  deleteCours(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/collections/cours/records/${id}`, {
      headers: this.getHeaders()
    });
  }

  deleteSujet(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/collections/sujets/records/${id}`, {
      headers: this.getHeaders()
    });
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/collections/posts/records/${id}`, {
      headers: this.getHeaders()
    });
  }

  getCoursWithPagination(page: number = 1, perPage: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/collections/cours/records?page=${page}&perPage=${perPage}`, {
      headers: this.getHeaders()
    });
  }

  getSujetsWithPagination(coursId: string, page: number = 1, perPage: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/collections/sujets/records?filter=cours="${coursId}"&expand=auteur&sort=-created&page=${page}&perPage=${perPage}`, {
      headers: this.getHeaders()
    });
  }

  getPostsWithPagination(sujetId: string, page: number = 1, perPage: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/collections/posts/records?filter=sujet="${sujetId}"&expand=auteur&page=${page}&perPage=${perPage}`, {
      headers: this.getHeaders()
    });
  }

  isOwner(itemAuthorId: string): boolean {
    return this.userId === itemAuthorId;
  }

  private getHeaders(): HttpHeaders {
    console.log("🛡️ Token envoyé dans le header :", this.token);
    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
  }
}
