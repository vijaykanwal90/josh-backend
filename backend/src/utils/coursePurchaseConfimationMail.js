import sendMail from "./sendMail.js";


export const sendPurchaseConfirmationMail = async ({ user, payment, bundles = [], courses = [] }) => {
    const purchaseDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const courseList = courses.map(course => `- ${course.title}`).join('\n');
    const bundleList = bundles.map(bundle => `- ${bundle.bundleName}`).join('\n');

    const message = `Hi ${user.name},

Thank you for your purchase on JoshGuru! 🎉

🧾 Order Summary:
Order ID: ${payment.orderId}
Date: ${purchaseDate}
Payment Status: ${payment.status.toUpperCase()}

${bundles.length ? `📦 Purchased Bundles:\n${bundleList}` : ''}
${courses.length ? `🎓 Purchased Courses:\n${courseList}` : ''}

You now have full access to your purchased items on your dashboard:
https://joshguru.com/dashboard

📚 Start exploring and keep learning!

If you have any questions, feel free to reach out to us at support@joshguru.com.

Best regards,  
Team JoshGuru  
https://joshguru.com

Follow us:  
Facebook: https://www.facebook.com/JoshGurukul  
Twitter: https://x.com/JoshguruOffice  
Instagram: https://www.instagram.com/joshguru.in
`;

    await sendMail({
        from: process.env.MAIL,
        to: user.email,
        subject: `✅ Your Order is Confirmed - JoshGuru`,
        text: message,
    });
};
