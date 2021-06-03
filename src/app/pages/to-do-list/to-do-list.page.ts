import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-to-do-list',
  templateUrl: './to-do-list.page.html',
  styleUrls: ['./to-do-list.page.scss'],
})
export class ToDoListPage implements OnInit {

  nameGroup = "Nombre grupo";
  //items: Observable<any>[] = [];
  items = [{ message: "Traer cuadernos" }, { message: "Examen de mate firmado" }];

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  changePath(path) {
    this.router.navigate([path]);
  }
}
