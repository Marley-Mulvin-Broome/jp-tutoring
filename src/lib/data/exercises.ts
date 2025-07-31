import type { ReadingCollection } from '../types';

export const collections: ReadingCollection[] = [
	{
		id: 'daily-life',
		title: '日常生活',
		description: '日常の生活に関する読み物練習',
		level: '初級',
		exercises: [
			{
				id: 'daily-life-1',
				title: '友達との会話',
				readingText: `
					<p>田中さんは毎朝<strong>七時</strong>に起きます。朝ごはんを食べてから、<em>電車</em>で学校に行きます。</p>
					<p>学校では友達と日本語を勉強します。昼休みに友達と一緒に<strong>お弁当</strong>を食べます。</p>
					<p>午後三時に授業が終わります。それから、図書館で宿題をします。</p>
				`,
				questions: [
					{
						id: 'q1',
						question: '田中さんは何時に起きますか？',
						options: ['六時', '七時', '八時', '九時'],
						correctAnswer: 1
					},
					{
						id: 'q2',
						question: '田中さんはどうやって学校に行きますか？',
						options: ['バスで', '電車で', '車で', '歩いて'],
						correctAnswer: 1
					},
					{
						id: 'q3',
						question: '昼休みに何をしますか？',
						options: ['宿題をします', 'お弁当を食べます', '図書館に行きます', '家に帰ります'],
						correctAnswer: 1
					}
				]
			},
			{
				id: 'daily-life-2',
				title: '週末の計画',
				readingText: `
					<p>明日は<strong>土曜日</strong>です。山田さんは友達と映画を見に行きます。</p>
					<p>映画は<em>午後二時</em>から始まります。映画の後で、カフェでコーヒーを飲みます。</p>
					<p>夕方には家に帰って、家族と夕食を食べます。</p>
				`,
				questions: [
					{
						id: 'q1',
						question: '明日は何曜日ですか？',
						options: ['金曜日', '土曜日', '日曜日', '月曜日'],
						correctAnswer: 1
					},
					{
						id: 'q2',
						question: '映画は何時から始まりますか？',
						options: ['午後一時', '午後二時', '午後三時', '午後四時'],
						correctAnswer: 1
					},
					{
						id: 'q3',
						question: '映画の後で何をしますか？',
						options: ['家に帰ります', '買い物をします', 'カフェでコーヒーを飲みます', '公園に行きます'],
						correctAnswer: 2
					}
				]
			}
		]
	},
	{
		id: 'school-life',
		title: '学校生活',
		description: '学校での出来事や授業に関する読み物',
		level: '初級',
		exercises: [
			{
				id: 'school-life-1',
				title: '高校の一日',
				readingText: `
					<p>佐藤さんは<strong>高校生</strong>です。毎日朝八時に学校に着きます。</p>
					<p>一時間目は<em>数学</em>の授業です。数学はちょっと難しいですが、先生がとても親切です。</p>
					<p>放課後はテニス部の活動があります。佐藤さんはテニスが大好きです。</p>
				`,
				questions: [
					{
						id: 'q1',
						question: '佐藤さんは何時に学校に着きますか？',
						options: ['朝七時', '朝八時', '朝九時', '朝十時'],
						correctAnswer: 1
					},
					{
						id: 'q2',
						question: '一時間目は何の授業ですか？',
						options: ['英語', '国語', '数学', '理科'],
						correctAnswer: 2
					},
					{
						id: 'q3',
						question: '放課後は何をしますか？',
						options: ['宿題をします', 'テニス部の活動があります', '友達と遊びます', '家に帰ります'],
						correctAnswer: 1
					}
				]
			},
			{
				id: 'school-life-2',
				title: '図書館での勉強',
				readingText: `
					<p>中村さんは大学生です。試験が近いので、毎日<strong>図書館</strong>で勉強しています。</p>
					<p>図書館は<em>静か</em>で、集中して勉強できます。いつも同じ席に座ります。</p>
					<p>昼休みになると、友達と一緒に学食でランチを食べます。</p>
				`,
				questions: [
					{
						id: 'q1',
						question: '中村さんはどこで勉強していますか？',
						options: ['教室で', '図書館で', '家で', 'カフェで'],
						correctAnswer: 1
					},
					{
						id: 'q2',
						question: '図書館はどんな場所ですか？',
						options: ['うるさい', '静か', '暗い', '狭い'],
						correctAnswer: 1
					},
					{
						id: 'q3',
						question: '昼休みに何をしますか？',
						options: ['勉強を続けます', '図書館で本を読みます', '友達とランチを食べます', '家に帰ります'],
						correctAnswer: 2
					}
				]
			}
		]
	},
	{
		id: 'travel',
		title: '旅行',
		description: '旅行や観光に関する読み物練習',
		level: '中級',
		exercises: [
			{
				id: 'travel-1',
				title: '京都旅行',
				readingText: `
					<p>先週末、友達と<strong>京都</strong>に行きました。京都は日本の古い都市で、たくさんの<em>お寺</em>があります。</p>
					<p>まず、<strong>清水寺</strong>を見学しました。そこからの景色はとても美しかったです。</p>
					<p>お昼は伝統的な<em>和食</em>を食べました。とてもおいしかったです。夕方に大阪に帰りました。</p>
				`,
				questions: [
					{
						id: 'q1',
						question: 'いつ京都に行きましたか？',
						options: ['今週末', '先週末', '来週末', '先月'],
						correctAnswer: 1
					},
					{
						id: 'q2',
						question: '最初にどこを見学しましたか？',
						options: ['金閣寺', '銀閣寺', '清水寺', '伏見稲荷'],
						correctAnswer: 2
					},
					{
						id: 'q3',
						question: 'お昼に何を食べましたか？',
						options: ['中華料理', '洋食', '和食', 'イタリア料理'],
						correctAnswer: 2
					}
				]
			}
		]
	}
];

// Helper function to get a specific collection
export function getCollectionById(id: string): ReadingCollection | undefined {
	return collections.find(collection => collection.id === id);
}

// Helper function to get all exercises from a collection
export function getExercisesByCollection(collectionId: string): ReadingCollection['exercises'] {
	const collection = getCollectionById(collectionId);
	return collection ? collection.exercises : [];
}
