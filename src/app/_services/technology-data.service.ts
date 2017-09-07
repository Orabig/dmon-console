import { Injectable } from '@angular/core';
import { Technology } from '../_models/templates/technology';

@Injectable()
export class TechnologyDataService {


  // Placeholder for last id so we can simulate
  // automatic incrementing of id's
  lastId: number = 0;

  // Placeholder for technology's
  technologies: Technology[] = [];

  constructor() {
  }

  // Simulate POST /technologies
  addTechnology(technology: Technology): TechnologyDataService {
    if (!technology.id) {
      technology.id = ++this.lastId;
    }
    this.technologies.push(technology);
    return this;
  }

  // Simulate DELETE /technologies/:id
  deleteTechnologyById(id: number): TechnologyDataService {
    this.technologies = this.technologies
      .filter(technology => technology.id !== id);
    return this;
  }

  // Simulate PUT /technologies/:id
  updateTechnologyById(id: number, values: Object = {}): Technology {
    let technology = this.getTechnologyById(id);
    if (!technology) {
      return null;
    }
    Object.assign(technology, values);
    return technology;
  }

  // Simulate GET /technologies
  getAllTechnologies(): Technology[] {
    return this.technologies;
  }

  // Simulate GET /technologies/:id
  getTechnologyById(id: number): Technology {
    return this.technologies
      .filter(technology => technology.id === id)
      .pop();
  }
}
