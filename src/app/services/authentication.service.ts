import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { User } from '../models/user';


import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/switchMap';


@Injectable()
export class AuthenticationService {

  public user: BehaviorSubject<User> = new BehaviorSubject(null);

  constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase, private router: Router) {
    this.afAuth.authState.switchMap(auth => {
      if (auth) {
        return this.db.object('users/' + auth.uid);
      } else {
        return Observable.of(null);
      }
    })
      .subscribe(user => {
        this.user.next(user);
      });
  }

  login(email, password) {
    try {
      throw this.afAuth.auth.signInWithEmailAndPassword(email, password)
        .then(credential => {
          this.updateUser(credential.user);
        });
    } catch (e) {
      return false;
    }
  }


  logout() {
    this.afAuth.auth.signOut();
  }

  private updateUser(authData) {
    const userData = new User(authData);
    const ref = this.db.object('users/' + authData.uid);
    ref.take(1).subscribe(user => {
      if (!user.role) {
        ref.update(userData);
      }
    });
  }

  signUp(email, password) {
    this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then(credendial => {
        const userData = {
          uid: credendial.uid,
          email: credendial.email,
          planes: [],
          rides: []
        };
        this.db.list('users').push(new User(userData));
      });
  }

}
