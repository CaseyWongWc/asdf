import { type Graph, type InsertGraph } from "@shared/schema";

export interface IStorage {
  createGraph(graph: InsertGraph): Promise<Graph>;
  getGraph(id: number): Promise<Graph | undefined>;
  updateGraph(id: number, graph: InsertGraph): Promise<Graph | undefined>;
  deleteGraph(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private graphs: Map<number, Graph>;
  private currentId: number;

  constructor() {
    this.graphs = new Map();
    this.currentId = 1;
  }

  async createGraph(graphData: InsertGraph): Promise<Graph> {
    const id = this.currentId++;
    const graph: Graph = { ...graphData, id };
    this.graphs.set(id, graph);
    return graph;
  }

  async getGraph(id: number): Promise<Graph | undefined> {
    return this.graphs.get(id);
  }

  async updateGraph(id: number, graphData: InsertGraph): Promise<Graph | undefined> {
    if (!this.graphs.has(id)) {
      return undefined;
    }
    
    const updatedGraph: Graph = { ...graphData, id };
    this.graphs.set(id, updatedGraph);
    return updatedGraph;
  }

  async deleteGraph(id: number): Promise<boolean> {
    return this.graphs.delete(id);
  }
}

export const storage = new MemStorage();
