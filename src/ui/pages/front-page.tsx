import React from 'react';
import { useState } from 'react';
import { User } from '../../backend/user'
import { users } from '../../backend/controller'
import { Stack } from "@mui/material";
import ThreadCard from "../components/thread-card";
import { Box } from "@mui/material";

const threads = [
    {
        id: 1,
        title: "First thread",
        body: "This is the first thread.",
        author: "Lolita",
    },
    {
        id: 2,
        title: "Second thread",
        body: "Another thread with some example text.",
        author: "User123",
    },
];


export default function FrontPage() {
    return (
        <Box sx={{ maxWidth: 700, margin: "0 auto", padding: 2 }}>
            <Stack spacing={2}>
                {threads.map((thread) => (
                    <ThreadCard key={thread.id} thread={thread} />
                ))}
            </Stack>
        </Box>
    );
}
