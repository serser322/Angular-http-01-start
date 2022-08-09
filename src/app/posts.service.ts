import { Injectable} from '@angular/core'
import { HttpClient, HttpEventType, HttpHeaders, HttpParams } from '@angular/common/http'
import { map, catchError, tap } from 'rxjs/operators'
import { Subject, throwError } from 'rxjs'

import { Post } from './post.model'

@Injectable({providedIn: 'root'})
export class PostsService {
  error = new Subject<string>()

  constructor(private http: HttpClient){}

  createAndStorePost(title: string, content: string){
    const postData: Post = {title:title, content:content}

    this.http.
      post<{name:string}>(
        'https://ng-complete-guide-61cac-default-rtdb.asia-southeast1.firebasedatabase.app/posts.json',
         postData,
         {
            observe:'response'  //回傳完整的物件(如statusCode、statusText等等)，而非只有body資料
         }) //回傳一個包覆著request的observable
      .subscribe(responseData => { //有subscribe，Angular才知道有人對這筆資料有興趣，才會傳送request
        console.log(responseData);
      }, error => {
        this.error.next(error.message)
      })
  }

  fetchPosts() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('print', 'pretty');  //此為Firebase提供的query params  //append回傳一個新的HttpParams物件
    searchParams = searchParams.append('custom', 'key');

    //從subscribe改為回傳一個observable
    return this.http
      .get<{[key: string]: Post}>(
        'https://ng-complete-guide-61cac-default-rtdb.asia-southeast1.firebasedatabase.app/posts.json',
        {
          headers: new HttpHeaders({"Custom-Header":"Hello"}), //http第二個參數為物件options，可傳送相關參數
          params: searchParams,
          responseType:'json' //回傳的格式，預設為'json'  //注意需與一開始的泛型一致
        })  //response type  
      .pipe(
        // map((responseData: {[key: string]: Post})  => {
        map(responseData  => {
        const postsArray: Post[] = []
        for (const [key, value] of Object.entries(responseData)){
          postsArray.push({...value, id:key})
        }
        return postsArray
      }),
      catchError( errorResponse => {
        //進行一些處理...
        return throwError(errorResponse)
      }))
      // .subscribe(posts => { //Component需要responseData，故改在Component去subscribe
      //   console.log(posts);
      // })
  }

  deletePosts() {
    return this.http.delete(
      'https://ng-complete-guide-61cac-default-rtdb.asia-southeast1.firebasedatabase.app/posts.json',
      {
        observe:'events'
      }
    )
    .pipe(
      tap( event => {
        console.log(event);
        if (event.type === HttpEventType.Sent){  //typescript中，不同事件有不同編號，HttpEventType則會傳該事件的編號
          console.log('Requst sending successful.');
        }
        if (event.type === HttpEventType.Response){
          console.log(event.body); //回傳null，因為body資料已被清空
        }
      })
    )  
  }
}