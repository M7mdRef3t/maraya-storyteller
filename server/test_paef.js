import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3111/ws?sessionId=test_spam_1&userId=tester');

let receivedAck = false;
let receivedPlan = false;
let startTime = Date.now();

ws.on('open', () => {
    console.log('Connected to WS. Sending start_story...');
    ws.send(JSON.stringify({ type: 'start_story', emotion: 'hope', output_mode: 'judge_en' }));
});

ws.on('message', (data) => {
    const msg = JSON.parse(data);

    if (msg.type === 'scene') {
        console.log(`[TEST] Received scene. Now spamming redirect_intent...`);

        // Spam intents
        for (let i = 0; i < 5; i++) {
            ws.send(JSON.stringify({
                type: 'redirect_intent',
                command: 'Nightmare',
                intensity: 0.9,
                v: msg.v,
                sceneId: msg.scene.scene_id,
                atIndex: 0
            }));
        }
    }

    if (msg.type === 'redirect_ack') {
        if (!receivedAck) {
            console.log(`[TEST] ✅ Received redirect_ack in ${Date.now() - startTime}ms. v: ${msg.v}, serverTs: ${msg.serverTs}`);
            receivedAck = true;
        }
    }

    if (msg.type === 'intervention_plan') {
        console.log(`[TEST] ✅ Received intervention_plan in ${Date.now() - startTime}ms. Plan:`, msg.plan);
        receivedPlan = true;

        // Execute bypass
        ws.send(JSON.stringify({
            type: 'redirect_execute',
            command: 'Nightmare',
            intensity: 0.9,
            v: msg.v,
            sceneId: msg.sceneId,
            atIndex: 0,
            bypass: false,
            appliedDelayMs: msg.plan.delayMs || 0
        }));

        // Send a stale execute to test gating
        ws.send(JSON.stringify({
            type: 'redirect_execute',
            command: 'Stale',
            intensity: 0.1,
            v: msg.v - 1, // Stale version
            sceneId: msg.sceneId,
            atIndex: 0,
            bypass: false,
            appliedDelayMs: 0
        }));

        setTimeout(() => {
            console.log('Closing WS...');
            ws.close();
            process.exit(0);
        }, 5000);
    }
});
