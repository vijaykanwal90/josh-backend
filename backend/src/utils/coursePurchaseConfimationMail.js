import sendMail from "./sendMail.js";

export const sendPurchaseConfirmationMail = async ({
    user,
    payment,
    bundles = [],
    courses = [],
}) => {
    const purchaseDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // List of courses
    const courseList = courses.map((course) => `- ${course.title}`).join('\n');

    // List of bundles
    const bundleList = bundles.map((bundle) => `- ${bundle.bundleName}`).join('\n');

    // Referral messages for trending courses
    let trendingReferralMsg = '';
    for (const course of courses) {
        if (course.isTrending) {
            trendingReferralMsg += `You can refer this course to your friends and earn commission up to 10%\nReferral code: ${user.sharableReferralCode}\nReferral link: https://joshguru.com/signup?referralCode=${user.sharableReferralCode}\n\n`;
        }
    }

    // Referral messages for bundles
    let bundleReferralMsg = '';
    if (bundles.length >= 1) {
        bundleReferralMsg = `You can refer these bundles to your friends and earn commission up to 30% on first level and 25% on the second (up to 55%)\nReferral code: ${user.sharableReferralCode}\nReferral link: https://joshguru.com/signup?referralCode=${user.sharableReferralCode}\n\n`;
    }

    const message = `Hi ${user.name},

Thank you for your purchase on JoshGuru! 🎉

🧾 Order Summary:
Order ID: ${payment.orderId}
Date: ${purchaseDate}
Payment Status: ${payment.status.toUpperCase()}

${bundles.length ? `📦 Purchased Bundles:\n${bundleList}` : ''}
${courses.length ? `🎓 Purchased Courses:\n${courseList}` : ''}

${trendingReferralMsg}
${bundleReferralMsg}

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
        text: message 
    });
};

