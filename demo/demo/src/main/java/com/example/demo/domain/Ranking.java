package com.example.demo.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@ToString(exclude = {"game","member"})
@Table(
        indexes = {
                @Index(columnList = "game_id",name = "idx_ranking_game_id"),
                @Index(columnList = "game_id, member_id",name = "idx_ranking_game_member_id")
        }
)
public class Ranking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer score;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id")
    private Game game;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    public void setGame(Game game) {
        this.game = game;
    }

    public void setMember(Member member) {
        this.member = member;
    }

    public void updateScore(Integer score) {
        this.score=score;
    }
}
