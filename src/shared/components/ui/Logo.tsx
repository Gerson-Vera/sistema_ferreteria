import Image from 'next/image';

type Props = {
  width?: number;
  height?: number;
};

export default function Logo({ width = 180, height = 64 }: Props) {
  return (
    <Image
      src="/logo/img/logo-ferreteria.png"
      alt="Logo Inversiones Andrew Valentino E.I.R.L."
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
      priority
    />
  );
}
