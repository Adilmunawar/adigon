
import React from 'react';

const DeveloperCredit = ({ className }: { className?: string }) => {
  return (
    <footer className={className}>
      <p className="text-center text-sm text-muted-foreground">
        Proudly Developed by{' '}
        <a
          href="https://github.com/Adil-Munawar-Official"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary/90 hover:text-primary transition-colors"
        >
          <span className="relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
            Adil Munawar
          </span>
        </a>
      </p>
    </footer>
  );
};

export default DeveloperCredit;
