import React from 'react';

import { cn } from '@/lib/utils';
import type { IDivision, IOrganization, ITeam, ITokenBucketWithSubject, IUser } from '@/types';

interface ModelSubjectProps {
  className?: string;
  subjectType: string;
  subject: ITokenBucketWithSubject['subject'];
  hideName?: boolean;
}

const STYLE_MAP = {
  organization: {
    soft: 'bg-orange-500/80',
    main: 'bg-orange-500',
    strong: 'bg-orange-600',
  },
  division: {
    soft: 'bg-yellow-500/80',
    main: 'bg-yellow-500',
    strong: 'bg-yellow-600',
  },
  team: {
    soft: 'bg-lime-500/80',
    main: 'bg-lime-500',
    strong: 'bg-lime-600',
  },
  user: {
    soft: 'bg-emerald-500/80',
    main: 'bg-emerald-500',
    strong: 'bg-emerald-600',
  },
} as const;

const ModelSubject: React.FC<ModelSubjectProps> = ({
  className,
  subjectType,
  subject: originalSubject,
  hideName = false,
}) => {
  const styles = STYLE_MAP[subjectType as keyof typeof STYLE_MAP];

  if (!styles) {
    return <span className="text-red-600">Not a valid subject</span>;
  }

  let name: string | undefined;
  let slug: string;

  switch (subjectType) {
    case 'organization': {
      const subject = originalSubject as IOrganization;
      name = subject.name;
      slug = subject.slug;
      break;
    }

    case 'division': {
      const subject = originalSubject as IDivision;
      name = subject.name;
      slug = subject.slug;
      break;
    }

    case 'team': {
      const subject = originalSubject as ITeam;
      name = subject.name;
      slug = subject.slug;
      break;
    }

    case 'user': {
      const subject = originalSubject as IUser;
      name = `${subject.first_name} ${subject.last_name}`;
      slug = subject.username;
      break;
    }

    default:
      return <span className="text-red-600">Not a valid subject</span>;
  }

  return (
    <div className={cn('flex items-center', className)}>
      <span className={cn('rounded-s-2xl px-2 py-1 text-gray-950', styles.soft)}>
        {subjectType}
      </span>

      {!hideName && name && (
        <span className={cn('px-2 py-1 font-semibold text-gray-950', styles.main)}>{name}</span>
      )}

      <span
        className={cn(
          'rounded-e-2xl px-2 py-1 font-semibold text-gray-950 uppercase',
          styles.strong
        )}>
        {slug}
      </span>
    </div>
  );
};

export default ModelSubject;
