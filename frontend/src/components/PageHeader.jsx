const PageHeader = ({ title, subtitle, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-sp-6">
    <div>
      <h1>{title}</h1>
      {subtitle && <p className="text-neutral-700 mt-1">{subtitle}</p>}
    </div>
    {children && <div className="flex flex-wrap gap-2 shrink-0">{children}</div>}
  </div>
);

export default PageHeader;  
