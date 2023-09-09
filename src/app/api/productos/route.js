import { NextResponse } from "next/server";

export async function GET() {

  const res = await fetch("https://dummyjson.com/products");
  const data = await res.json()
  return NextResponse.json(data)
}

export async function POST(request) {
  const {nombre, apellido} = await request.json();
  console.log(nombre, apellido)
  return NextResponse.json({
    message: "Creando DATOS!"
  })
}

export function DELETE() {
  return NextResponse.json({
    message: "Borrar datos!"
  })
}

export function PUT() {
  return NextResponse.json({
    message: "Actualizando datos!"
  })
}

