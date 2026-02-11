'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BlogPost } from '@/lib/blog-server';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
// @ts-ignore
import { motion } from 'framer-motion';

interface BlogCardProps {
    post: BlogPost;
    index: number;
}

export function BlogCard({ post, index }: BlogCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
        >
            <Link href={`/blog/${post.slug}`} className="block h-full">
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 group bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex justify-between items-start gap-4 mb-2">
                            <div className="flex flex-wrap gap-2">
                                {post.tags?.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs capitalize">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors line-clamp-2 md:text-2xl">
                            {post.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="line-clamp-3 leading-relaxed">
                            {post.excerpt}
                        </CardDescription>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                                {post.author?.photoURL ?
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={post.author.photoURL} alt={post.author.displayName} className="h-full w-full object-cover" />
                                    : <User className="h-3 w-3 text-primary" />
                                }
                            </div>
                            <span>{post.author?.displayName || 'Tool Daddy Team'}</span>
                        </div>
                        <div className="flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                            Read More <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                    </CardFooter>
                </Card>
            </Link>
        </motion.div>
    );
}
