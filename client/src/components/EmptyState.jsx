export default function EmptyState({ title, hint }) {
  return (
    <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-white">
      <p className="text-slate-600 font-medium">{title}</p>
      {hint && <p className="text-sm text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
