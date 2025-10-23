import db from '@/shared/config/db.config';
import { logger } from '@/shared/core/logger';
import { hashPassword } from '@/shared/utils/passwords';

async function seed() {
  try {
    logger.info('Starting database seed...');

    // Create initial tags
    const tags = [
      { slug: 'valorant', label: 'Valorant', aliases: ['valo'] },
      { slug: 'cs2', label: 'CS2', aliases: ['cs', 'counter-strike'] },
      { slug: 'lol', label: 'League of Legends', aliases: ['league', 'lolzinho'] },
      { slug: 'fortnite', label: 'Fortnite', aliases: ['fort'] },
      { slug: 'apex', label: 'Apex Legends', aliases: ['apex'] },
      { slug: 'overwatch', label: 'Overwatch', aliases: ['ow'] },
      { slug: 'dota2', label: 'Dota 2', aliases: ['dota'] },
      { slug: 'rocket-league', label: 'Rocket League', aliases: ['rl'] },
    ];

    for (const tag of tags) {
      await db.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: tag,
      });
    }

    // Create feature slots
    const featureSlots = [
      { slot_key: 'home_hero' as const, description: 'Hero banner on homepage' },
      { slot_key: 'home_rail' as const, description: 'Featured players rail on homepage' },
      { slot_key: 'sidebar_banner' as const, description: 'Sidebar banner' },
    ];

    for (const slot of featureSlots) {
      await db.feature_slot.upsert({
        where: { slot_key: slot.slot_key },
        update: {},
        create: slot,
      });
    }

    // Create initial settings
    const settings = [
      {
        key: 'content_policy_v1',
        value_json: {
          nsfw_threshold: 0.7,
          max_file_size_mb: 50,
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm'],
        },
      },
      {
        key: 'limits',
        value_json: {
          max_media_per_player: 20,
          max_bio_length: 500,
          max_username_length: 30,
        },
      },
      {
        key: 'rate_limits',
        value_json: {
          contact_per_hour: 5,
          reports_per_hour: 3,
          uploads_per_hour: 10,
        },
      },
    ];

    for (const setting of settings) {
      await db.setting.upsert({
        where: { key: setting.key },
        update: { value_json: setting.value_json },
        create: setting,
      });
    }

    // Create test users for E2E tests
    const testUsers = [
      {
        email: 'admin@test.com',
        password: 'admin123456',
        username: 'admin_test',
        display_name: 'Admin Test',
        state: 'SP',
        city: 'São Paulo',
        city_slug: 'sao-paulo',
        role: 'admin' as const,
      },
      {
        email: 'moderator@test.com',
        password: 'mod123456',
        username: 'mod_test',
        display_name: 'Moderator Test',
        state: 'RJ',
        city: 'Rio de Janeiro',
        city_slug: 'rio-de-janeiro',
        role: 'moderator' as const,
      },
      {
        email: 'player@test.com',
        password: 'player123456',
        username: 'player_test',
        display_name: 'Player Test',
        state: 'MG',
        city: 'Belo Horizonte',
        city_slug: 'belo-horizonte',
        role: 'player' as const,
      },
      {
        email: 'inactive@test.com',
        password: 'inactive123456',
        username: 'inactive_test',
        display_name: 'Inactive Test',
        state: 'RS',
        city: 'Porto Alegre',
        city_slug: 'porto-alegre',
        role: 'player' as const,
        status: 'suspended' as const,
      },
    ];

    for (const userData of testUsers) {
      const password_hash = await hashPassword(userData.password);

      // Create user
      const user = await db.user.upsert({
        where: { email: userData.email },
        update: {
          password_hash,
          role: userData.role,
          status: userData.status ?? 'active',
        },
        create: {
          email: userData.email,
          password_hash,
          role: userData.role,
          status: userData.status ?? 'active',
        },
      });

      // Create profile for the user
      await db.profile.upsert({
        where: { user_id: user.id },
        update: {
          username: userData.username,
          display_name: userData.display_name,
          state: userData.state,
          city: userData.city,
          city_slug: userData.city_slug,
          status: userData.status === 'suspended' ? 'suspended' : 'active',
        },
        create: {
          user_id: user.id,
          username: userData.username,
          display_name: userData.display_name,
          state: userData.state,
          city: userData.city,
          city_slug: userData.city_slug,
          status: userData.status === 'suspended' ? 'suspended' : 'active',
        },
      });
    }

    logger.info('Database seed completed successfully');
  } catch (error) {
    logger.error({ error }, 'Database seed failed');
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Executar seed se o arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch(error => {
    logger.error({ error }, 'Seed failed');
    process.exit(1);
  });
}

export default seed;
