import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req, res) {
  const { token, action, payload, tg_id } = req.body;

  const { data: briefcase, error } = await supabase
    .from('briefcases')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !briefcase) return res.status(404).json({ error: 'Briefcase not found' });

  // Guard: Ensure user is part of this briefcase
  if (tg_id != briefcase.right_hand_id && tg_id != briefcase.left_hand_id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (action === 'lock_assets') {
    // Left_hand locks the Access Keys
    if (tg_id != briefcase.left_hand_id) return res.status(403).send('Only Left_hand can lock keys');
    
    const { error: updateErr } = await supabase
      .from('briefcases')
      .update({ access_keys: payload.keys })
      .eq('token', token);

    return updateErr ? res.status(500).send('Update failed') : res.status(200).json({ status: 'Locked' });
  }

  if (action === 'fund') {
    // Right_hand funds the briefcase
    const amount = parseFloat(payload.amount);
    const fee = amount * 0.05;

    const { error: fundErr } = await supabase
      .from('briefcases')
      .update({ 
        amount: amount, 
        fee_amount: fee, 
        payment_status: 'funded',
        payment_method: payload.method 
      })
      .eq('token', token);

    return fundErr ? res.status(500).send('Funding failed') : res.status(200).json({ status: 'Funded' });
  }

  res.status(400).send('Invalid Action');
}