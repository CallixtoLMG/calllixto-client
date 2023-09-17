import Image from 'next/image';

export default function Home() {
  return (
    <main style={{margin: "150px"}}>
      <h1>Somos Callixto!</h1>
      <Image
        src="/callixto.png"
        alt="Callixto logo"
        width={100}
        height={40}
      />
    </main>
  )
}
