import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {

  constructor(private popoverController: PopoverController) { }

  ngOnInit() { }

  showAll() {
    this.popoverController.dismiss(0);
  }

  showPending() {
    this.popoverController.dismiss(1);
  }

  showCompleted() {
    this.popoverController.dismiss(2);
  }

}
