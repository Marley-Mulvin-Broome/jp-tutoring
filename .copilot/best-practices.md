# Svelte 5 Best Practices Guide

This guide outlines best practices for developing components with Svelte 5, highlighting the differences from Svelte 4 and providing examples of good and bad patterns.

## Table of Contents

- [Svelte 5 Best Practices Guide](#svelte-5-best-practices-guide)
  - [Table of Contents](#table-of-contents)
  - [Runes and State Management](#runes-and-state-management)
    - [Using `$state` Rune](#using-state-rune)
    - [Derived State with `$derived`](#derived-state-with-derived)
    - [Using `$derived.by` for advanced states](#using-derivedby-for-advanced-states)
    - [Using `svelte:window` for `window` properties](#using-sveltewindow-for-window-properties)
  - [Component Structure](#component-structure)
    - [Use Tailwind and Merge Classes](#use-tailwind-and-merge-classes)
    - [Variants with TV](#variants-with-tv)
    - [Define Props with $props()](#define-props-with-props)
  - [Props and Attributes](#props-and-attributes)
    - [Type Your Props](#type-your-props)
  - [Event Handling](#event-handling)
    - [Event Forwarding](#event-forwarding)
  - [Lifecycle Management](#lifecycle-management)
    - [Cleanup with `$effect`](#cleanup-with-effect)
  - [Snippets](#snippets)
    - [Snippets Not Slots](#snippets-not-slots)
    - [Using Snippets for Reusable Template Parts](#using-snippets-for-reusable-template-parts)
  - [Reactivity](#reactivity)
    - [Using `$derived` vs Old `$:` Syntax](#using-derived-vs-old--syntax)
  - [Error Handling](#error-handling)
    - [Error Boundaries](#error-boundaries)

## Runes and State Management

### Using `$state` Rune

✅ **Good - Svelte 5**:

```svelte
<script>
	let count = $state(0);

	function increment() {
		count++;
	}
</script>

<button onclick={increment}>Count: {count}</button>
```

❌ Bad - Svelte 4 Style:

```svelte
<script>
	// Implicitely reactive, will not work in runes mode
	let count = 0;

	function increment() {
		count++;
	}
</script>

<button on:click={increment}>Count: {count}</button>
```

### Derived State with `$derived`

✅ Good:

```svelte
<script>
	let items = $state([1, 2, 3, 4, 5]);
	let filter = $state('all');

	let filteredItems = $derived(
		filter === 'all'
			? items
			: filter === 'even'
				? items.filter((n) => n % 2 === 0)
				: items.filter((n) => n % 2 !== 0)
	);
</script>

<div>
	{#each filteredItems as item}
		<div>{item}</div>
	{/each}
</div>
```

❌ Bad:

```svelte
<script>
	// Don't mix $: reactivity with runes
	let items = $state([1, 2, 3, 4, 5]);
	let filter = $state('all');

	$: filteredItems =
		filter === 'all'
			? items
			: filter === 'even'
				? items.filter((n) => n % 2 === 0)
				: items.filter((n) => n % 2 !== 0);
</script>
```

### Using `$derived.by` for advanced states

✅ Good:

```svelte
<script>
	import { fetchUserData } from './api';

	let userId = $state(1);

	// Using $derived.by to handle async data fetching
	let userData = $derived.by(() => {
		// This function is called when userId changes
		return fetchUserData(userId);
	});
</script>

<div>
	<button onclick={() => userId++}>Load next user</button>

	{#await userData}
		<p>Loading user data...</p>
	{:then data}
		<div>
			<h2>{data.name}</h2>
			<p>Email: {data.email}</p>
		</div>
	{:catch error}
		<p class="error">Error: {error.message}</p>
	{/await}
</div>
```

❌ Bad:

```svelte
<script>
	import { fetchUserData } from './api';

	let userId = $state(1);
	let userData = $state(null);
	let loading = $state(false);
	let error = $state(null);

	// Manually managing loading/error states and triggering the fetch
	$effect(async () => {
		loading = true;
		error = null;

		try {
			userData = await fetchUserData(userId);
		} catch (e) {
			error = e;
		} finally {
			loading = false;
		}
	});
</script>

<div>
	<button onclick={() => userId++}>Load next user</button>

	{#if loading}
		<p>Loading user data...</p>
	{:else if error}
		<p class="error">Error: {error.message}</p>
	{:else if userData}
		<div>
			<h2>{userData.name}</h2>
			<p>Email: {userData.email}</p>
		</div>
	{/if}
</div>
```

### Using `svelte:window` for `window` properties

Instead of making event listeners or checking if the `window` object is defined, bind from `svelte:window` instead.

✅ Good:

```svelte
<script>
	let windowWidth = $state(0);
	let windowHeight = $state(0);

	// The bind: syntax automatically updates when the window resizes
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<div>
	Window dimensions: {windowWidth} x {windowHeight}
</div>
```

❌ Bad:

```svelte
<script>
	let windowWidth = $state(0);
	let windowHeight = $state(0);

	// Don't manually add event listeners
	$effect(() => {
		// Need to check if window exists for SSR
		if (typeof window !== 'undefined') {
			windowWidth = window.innerWidth;
			windowHeight = window.innerHeight;

			const handleResize = () => {
				windowWidth = window.innerWidth;
				windowHeight = window.innerHeight;
			};

			window.addEventListener('resize', handleResize);

			return () => {
				window.removeEventListener('resize', handleResize);
			};
		}
	});
</script>

<div>
	Window dimensions: {windowWidth} x {windowHeight}
</div>
```

## Component Structure

### Use Tailwind and Merge Classes

✅ Good:

```svelte
<script lang="ts">
	//  ...Props definition, imports, etc.
	let { class: classes }: Props = $props();
</script>

<p class={twMerge('text-lg', classes)}>Hello there!</p>
```

### Variants with TV

```svelte
<script lang="ts">
	// Other parts of component like props...

	const button = tv({
		base: 'rounded-2xl font-bold cursor-pointer text-center',
		variants: {
			colour: {
				black: 'bg-black text-white',
				white: 'bg-white text-black'
			},
			variant: {
				normal: '',
				ghost: ''
			},
			size: {
				sm: 'font-medium px-6 py-3',
				md: 'text-lg px-4 py-3',
				lg: 'text-xl px-12 py-4',
				xl: 'text-2xl px-16 py-5'
			}
		}
	});
</script>

<button class={twMerge(button({ colour, variant, size }), classes)}>
	<!-- Button Content -->
</button>
```

### Define Props with $props()

✅ Good:

```svelte
<script>
	const { title = 'Default Title', showHeader = true } = $props();
	let isExpanded = $state(false);
</script>

{#if showHeader}
	<header>
		<h2>{title}</h2>
		<button onclick={() => (isExpanded = !isExpanded)}>
			{isExpanded ? 'Collapse' : 'Expand'}
		</button>
	</header>
{/if}
```

❌ Bad:

```svelte
<script>
	// Don't use export with runes
	export let title = 'Default Title';
	export let showHeader = true;
	let isExpanded = $state(false);
</script>
```

## Props and Attributes

### Type Your Props

✅ Good:

```svelte
<script lang="ts">
	import { ComponentBaseProps } from '$lib/types';
	import type { HTMLLiAttributes } from 'svelte/elements';

	// Since it is an LI element we can use attributes from it to automatically get type inference for it.
	interface Props extends ComponentBaseProps<HTMLLIAttributes> {
		title?: string;
		// Other props here
	}

	// Make sure to get rest
	let { class: classes, title, ...rest }: Props = $props();
</script>

<li class={classes} {...rest}>
	{title}
	<!-- More content... -->
</li>
```

## Event Handling

### Event Forwarding

✅ Good:

```svelte
<script lang="ts">
	interface Props extends ComponentBaseProps<HTMLButtonAttributes> {
		oncustom: () => void;
	}

	let { oncustom, ...rest }: Props = $props();
</script>

<!-- Since we inherited HTMLButtonAttributes onclick and other events are automatically forwarded -->
<button onmouseleave={oncustom} {...rest}> </button>
```

## Lifecycle Management

### Cleanup with `$effect`

✅ Good:

```svelte
<script>
	let interval;

	$effect(() => {
		interval = setInterval(() => console.log('tick'), 1000);

		// if a teardown function is provided, it will run
		// a) immediately before the effect re-runs
		// b) when the component is destroyed
		return () => clearInterval(interval);
	});
</script>
```

❌ Bad:

```svelte
<script>
	import { onMount, onDestroy } from 'svelte';

	let interval;

	onMount(() => {
		interval = setInterval(() => console.log('tick'), 1000);
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>
```

## Snippets

### Snippets Not Slots

✅ Good:

```svelte
<!-- Card.svelte -->
<script lang="ts">
	interface Props extends ComponentBaseProps {
		header?: Snippet;
		children?: Snippet;
		footer?: Snippet;
	}

	let { header, children, footer, ...rest }: Props = $props();
</script>

<div class="card" {...rest}>
	<div class="card-header">
		{@render header?.()}
	</div>
	<div class="card-body">
		{@render children?.()}
	</div>
	<div class="card-footer">
		{@render header?.()}
	</div>
</div>

<!-- Usage -->
<Card>
	{#snippet header()}
		<h2>Custom Header</h2>
	{/snippet}

	<!-- Children is implicit -->
	<p>Main content goes here</p>

	{#snippet footer()}
		<button>Save</button>
	{/snippet}
</Card>
```

### Using Snippets for Reusable Template Parts

✅ Good:

```svelte
{#snippet listItem(text: string)}
  <li>
    <p>{text}</p>
  </li>
{/snippet}

<ul>
  {@render listItem('Potato')}
  {@render listItem('Tree')}
  {@render listItem('Cat')}
  {@render listItem('Food')}
</ul>
```

## Reactivity

### Using `$derived` vs Old `$:` Syntax

✅ Good - Svelte 5:

```svelte
<script>
	let firstName = $state('John');
	let lastName = $state('Doe');

	let fullName = $derived(`${firstName} ${lastName}`);
	let greeting = $derived(`Hello, ${fullName}!`);
</script>
```

❌ Bad - Mixing Old and New:

```svelte
<script>
	let firstName = $state('John');
	let lastName = $state('Doe');

	// Don't mix $derived and $:
	let fullName = $derived(`${firstName} ${lastName}`);
	$: greeting = `Hello, ${fullName}!`;
</script>
```

## Error Handling

### Error Boundaries

Using `<svelte:boundary>` to handle components that tend to cause errors.

✅ Good - Svelte 5:

```svelte
<svelte:boundary onerror={reportError}>
	<FlakyComponent />

	{#snippet failed(error, reset)}
		<button onclick={reset}>oops! try again</button>
	{/snippet}
</svelte:boundary>
```
