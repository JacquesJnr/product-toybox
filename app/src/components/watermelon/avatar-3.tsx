import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Watermelon avatar-3: a square avatar with soft corners. Changed to take the author
// instead of a fixed profile, and to tint the initials with a hue taken from the name,
// so one person has one color across the vault.

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

const hueOf = (name: string) => {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return hash;
};

const Avatar3 = ({ name, src, size = 'default' }: { name: string | null; src?: string; size?: 'sm' | 'default' | 'lg' }) => {
  const hue = name ? hueOf(name) : 0;
  return (
    <Avatar size={size} className="rounded-sm after:rounded-sm">
      {src && name && <AvatarImage src={src} alt={name} className="rounded-sm" />}
      <AvatarFallback className="rounded-sm font-heading text-xs font-semibold"
        style={name ? { background: `oklch(0.93 0.035 ${hue})`, color: `oklch(0.42 0.09 ${hue})` } : undefined}>
        {name ? getInitials(name) : '?'}
      </AvatarFallback>
    </Avatar>
  );
};

export default Avatar3;
