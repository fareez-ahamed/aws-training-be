interface Product {
  name: string;
  price: number;
}

const PRODUCTS = [
  { id: 1, name: "Axiom A1", price: 23.54 },
  { id: 2, name: "Beta C", price: 9.99 },
  { id: 3, name: "Gamma X", price: 87.94 },
  { id: 4, name: "Alpha-B", price: 3.54 },
  { id: 5, name: "Axiom A1", price: 27.52 },
];

export async function getProducts(): Promise<Product[]> {
  return PRODUCTS;
}
export async function getProduct(id: number): Promise<Product | undefined> {
  return PRODUCTS.find((x) => x.id === id);
}
