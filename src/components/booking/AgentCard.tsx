import { Star, MapPin } from 'lucide-react';
import { AgentProfile } from '@/types';

interface AgentCardProps {
  agent: AgentProfile;
  onBookNow: (agent: AgentProfile) => void;
}

function AgentAvatar({ agent }: { agent: AgentProfile }) {
  const initials = (agent.name || 'A')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  if (agent.photo) {
    return (
      <img
        src={agent.photo}
        alt={agent.name}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 text-3xl font-bold text-white">
      {initials}
    </div>
  );
}

export default function AgentCard({ agent, onBookNow }: AgentCardProps) {
  const rating = Number(agent.averageRating) || 0;
  const completed = agent.completedTasks || 0;

  return (
    <div className="flex flex-col rounded-2xl bg-white p-6 shadow-lg shadow-black/5 transition-shadow hover:shadow-xl">
      {/* Agent Photo */}
      <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full ring-2 ring-green-100">
        <AgentAvatar agent={agent} />
      </div>

      {/* Agent Name */}
      <h3 className="text-center text-lg font-semibold text-gray-900">
        {agent.name}
      </h3>

      {/* Rating */}
      <div className="mt-3 flex items-center justify-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-200'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      </div>

      {/* Total Completed Tasks */}
      <p className="mt-1 text-center text-sm text-gray-500">
        {completed} completed task{completed === 1 ? '' : 's'}
      </p>

      {/* Service Area */}
      {agent.area && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{agent.area}</span>
        </div>
      )}

      {/* Services */}
      {agent.services && agent.services.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {agent.services.slice(0, 3).map((service, idx) => (
            <span
              key={idx}
              className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full"
            >
              {service}
            </span>
          ))}
        </div>
      )}

      {/* Book Now */}
      <button
        type="button"
        onClick={() => onBookNow(agent)}
        className="mt-6 w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Book Now
      </button>
    </div>
  );
}
