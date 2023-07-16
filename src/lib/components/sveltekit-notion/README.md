# svelte-notion

A simple Svelte renderer for Notion inspired by [react-notion](https://github.com/splitbee/react-notion)

# Installation

`npm i -D svelte-notion`

# Example

```
<Notion id="2e22de6b770e4166be301490f6ffd420" />

<script>
    import Notion from 'svelte-notion'
</script>
```

# Configuration

The `Notion` component accepts a few props:

| Prop       | Default                  | Required? | Description                                                            |
| ---------- | ------------------------ | --------- | ---------------------------------------------------------------------- |
| `id`       | `null`                   | yes       | ID for Notion Page                                                     |
| `api`      | `notion-api.splitbee.io` | no        | The API to use for fetching Notion data                                |
| `fullPage` | `false`                  | no        | Whether to display a full-width (`true`) or fixed-width (`false`) page |
