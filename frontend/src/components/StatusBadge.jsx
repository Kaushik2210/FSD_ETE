import { motion } from 'framer-motion';
import { STATUS_STYLES, STATUSES } from '../utils/constants.js';

export default function StatusBadge({ status, size = 'md' }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES[STATUSES[0]];
  const sizing = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <motion.span
      layout
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ${style.bg} ${style.text} ${style.ring} ${sizing}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </motion.span>
  );
}
