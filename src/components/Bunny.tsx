import { forwardRef } from 'react';

interface BunnyProps {
  className?: string;
}

const Bunny = forwardRef<HTMLDivElement, BunnyProps>(({ className = '' }, ref) => {
  return (
    <div ref={ref} className={`bunny ${className}`} style={{ position: 'absolute', left: 120 }}>
      <div className="bunny__ear bunny__ear--left" />
      <div className="bunny__ear bunny__ear--right" />
      <div className="bunny__body">
        <div className="bunny__eye" />
        <div className="bunny__nose" />
        <div className="bunny__cheek bunny__cheek--left" />
        <div className="bunny__cheek bunny__cheek--right" />
      </div>
      <div className="bunny__legs">
        <div className="bunny__leg bunny__leg--left" />
        <div className="bunny__leg bunny__leg--right" />
      </div>
      <div className="bunny__tail" />
    </div>
  );
});

Bunny.displayName = 'Bunny';

export default Bunny;
