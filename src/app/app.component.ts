import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators'

import { Post } from './post.model';
import { PostsService } from './posts.service'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  loadedPosts: Post[] = [];
  isFetching = false;
  error = null
  private errorSub : Subscription

  constructor(private http: HttpClient, private postsService: PostsService) {}

  ngOnInit() {
    this.errorSub = this.postsService.error.subscribe(errorMessage => {
      this.error = errorMessage
    })

    this.isFetching = true
    this.postsService.fetchPosts().subscribe( posts => {
      this.loadedPosts = posts
      this.isFetching = false
    }, error => {
      this.isFetching = false
      this.error = error.message
    })
  }

  onCreatePost(postData: { title: string; content: string }) {
    // Send Http request
    this.postsService.createAndStorePost(postData.title, postData.content)
  }

  onFetchPosts() {
    // Send Http request
    this.fetchPosts()
  }

  onClearPosts() {
    // Send Http request
    this.postsService.deletePosts().subscribe(() => {
      this.loadedPosts = []
    })
    
  }

  private fetchPosts(){
    this.isFetching = true
    this.postsService.fetchPosts().subscribe( posts => {
      this.loadedPosts = posts
      this.isFetching = false
    }, error => {
      this.isFetching = false
      this.error = error.message
    })
  }

  ngOnDestroy() {
    this.errorSub.unsubscribe()
  }
}
