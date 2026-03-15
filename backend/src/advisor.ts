import { nanoid } from 'nanoid'

export async function handleAdvisorBooking(c: any) {
  const user = c.get('user')
  const userId = user.userId
  const id = nanoid()

  await c.env.users.prepare(
    `INSERT INTO advisor_requests (id,user_id) VALUES (?,?)`
  ).bind(id, userId).run()

  // Trigger HubSpot email
  if (c.env.HUBSPOT_TOKEN) {
    try {
        // Trigger HubSpot Automation
        const res = await fetch('https://api.hubapi.com/automation/v3/workflows/enrollments/contacts/' + userId, {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${c.env.HUBSPOT_TOKEN}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: user.email }) // Pass email explicitly if possible, though workflow ID is usually needed
        })
        if (!res.ok) {
            console.error('HubSpot API Error:', await res.text())
        }
    } catch (e) {
        console.error('HubSpot Trigger Failed:', e)
    }
  } else {
      console.warn('HUBSPOT_TOKEN not set. Skipping email automation.')
  }

  return c.json({
    bookingUrl: 'https://meetings.hubspot.com/YOUR-ADVISOR-LINK'
  })
}
